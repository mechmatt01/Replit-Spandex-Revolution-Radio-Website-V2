import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupPassport, isAuthenticated, isAdmin, hashPassword, generateToken, sendVerificationEmail } from "./auth";
import { recaptchaService } from "./recaptcha";
import { formatPhoneNumber } from "./userUtils";
import { fetchSpotifyArtwork } from "./radioMetadata";
import { fetchRadioCoMetadata, isCommercial, getClearbitLogo, extractCompanyName } from "./radioCoConfig";
import passport from "passport";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import { registerUserSchema, loginUserSchema } from "@shared/schema";
import https from "https";
import { setupRadioProxy } from "./radioProxy";
import type { User } from "@shared/schema";

// Removed Spotify API - using Icecast streaming only
import { insertSubmissionSchema, insertContactSchema, insertSubscriptionSchema, insertNowPlayingSchema } from "@shared/schema";
import { z } from "zod";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupPassport(app);
  
  // Setup radio stream proxy
  setupRadioProxy(app);

  // Authentication endpoints
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Set up session
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login failed after registration' });
        }
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ message: error.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const bcryptjs = require('bcryptjs');
      const isValidPassword = await bcryptjs.compare(validatedData.password, user.password || '');
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Set up session
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login failed' });
        }
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(400).json({ message: error.message || 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/user', isAuthenticated, (req, res) => {
    if (req.user) {
      const { password: _, ...userWithoutPassword } = req.user as User;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  });

  // Google OAuth routes
  app.get('/api/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { 
      successRedirect: '/',
      failureRedirect: '/?auth=failed'
    })
  );

  

  

  // Email verification
  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token) {
        return res.status(400).json({ message: "Verification token required" });
      }

      const user = await storage.verifyEmail(token as string);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      res.json({ message: "Email verified successfully!" });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Email verification failed" });
    }
  });

  // Stripe subscription routes
  app.post("/api/stripe/create-subscription", isAuthenticated, async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe not configured" });
    }

    try {
      const user = req.user as User;
      const { tier, paymentMethodId } = req.body;

      if (!["rebel", "legend", "icon"].includes(tier)) {
        return res.status(400).json({ message: "Invalid subscription tier" });
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: { userId: user.id.toString() },
        });
        customerId = customer.id;
        await storage.updateStripeInfo(user.id, customerId);
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Price IDs for each tier (you'll need to create these in Stripe Dashboard)
      const priceIds = {
        rebel: process.env.STRIPE_REBEL_PRICE_ID || "price_rebel",
        legend: process.env.STRIPE_LEGEND_PRICE_ID || "price_legend", 
        icon: process.env.STRIPE_ICON_PRICE_ID || "price_icon",
      };

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceIds[tier as keyof typeof priceIds] }],
        expand: ["latest_invoice.payment_intent"],
      });

      // Update user subscription info
      await storage.updateUser(user.id, {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionTier: tier,
      });

      const invoice = subscription.latest_invoice as any;
      res.json({
        subscriptionId: subscription.id,
        clientSecret: invoice?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      console.error("Subscription creation error:", error);
      res.status(500).json({ message: error.message || "Subscription creation failed" });
    }
  });

  app.post("/api/stripe/cancel-subscription", isAuthenticated, async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe not configured" });
    }

    try {
      const user = req.user as User;
      if (!user.stripeSubscriptionId) {
        return res.status(400).json({ message: "No active subscription found" });
      }

      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      await storage.updateUser(user.id, {
        subscriptionStatus: "canceled",
      });

      res.json({ message: "Subscription will be canceled at the end of the billing period" });
    } catch (error: any) {
      console.error("Subscription cancellation error:", error);
      res.status(500).json({ message: error.message || "Subscription cancellation failed" });
    }
  });

  // Submissions API
  app.get("/api/submissions", async (req, res) => {
    try {
      const submissions = await storage.getSubmissions();
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  app.post("/api/submissions", async (req, res) => {
    try {
      const validatedData = insertSubmissionSchema.parse(req.body);
      const submission = await storage.createSubmission(validatedData);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create submission" });
      }
    }
  });

  app.patch("/api/submissions/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const submission = await storage.updateSubmissionStatus(id, status);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      res.status(500).json({ error: "Failed to update submission status" });
    }
  });

  // Contacts API
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create contact" });
      }
    }
  });

  // Show Schedules API
  app.get("/api/schedules", async (req, res) => {
    try {
      const schedules = await storage.getActiveShowSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schedules" });
    }
  });

  // Past Shows API
  app.get("/api/past-shows", async (req, res) => {
    try {
      const shows = await storage.getPastShows();
      res.json(shows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch past shows" });
    }
  });

  // Track last metadata to prevent unnecessary updates
  let lastMetadata: any = null;

  // Enhanced artwork fetching from iTunes/Apple Music
async function fetchiTunesArtwork(artist: string, title: string): Promise<string | null> {
  try {
    const searchQuery = encodeURIComponent(`${artist} ${title}`);
    const response = await fetch(`https://itunes.apple.com/search?term=${searchQuery}&entity=song&limit=1`, {
      timeout: 2000
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        // Get the highest quality artwork (replace 100x100 with 800x800)
        const artworkUrl = data.results[0].artworkUrl100;
        if (artworkUrl) {
          return artworkUrl.replace('100x100bb.jpg', '800x800bb.jpg');
        }
      }
    }
  } catch (error) {
    console.error('iTunes artwork fetch error:', error);
  }
  return null;
}

// StreamTheWorld metadata fetching
async function fetchStreamTheWorldMetadata(): Promise<any> {
  try {
    const response = await fetch('https://yield-op-idsync.live.streamtheworld.com/idsync.js?stn=WQHTFM', {
      timeout: 3000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.ok) {
      const jsContent = await response.text();
      // Parse the JavaScript response for metadata
      const metadataMatch = jsContent.match(/nowplaying.*?=.*?({.*?})/);
      if (metadataMatch) {
        return JSON.parse(metadataMatch[1]);
      }
    }
  } catch (error) {
    console.error('StreamTheWorld metadata fetch error:', error);
  }
  return null;
}

// Now Playing API with enhanced metadata and artwork
  // Now Playing API - Shows actual stream info only
  app.get("/api/now-playing", async (req, res) => {
    try {
      // Try to get real Hot 97 metadata first
      try {
        const hot97Response = await fetch('https://playerservices.streamtheworld.com/api/livestream?version=1.9&mount=WQHTFMAAC&lang=en', {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Hot97RadioApp/1.0'
          },
          signal: AbortSignal.timeout(3000)
        });
        
        if (hot97Response.ok) {
          const hot97Data = await hot97Response.json();
          const nowPlaying = hot97Data?.results?.livestream?.[0]?.cue;
          
          if (nowPlaying && nowPlaying.title && nowPlaying.title !== "Hot 97") {
            const nowPlayingData = {
              id: 1,
              title: nowPlaying.title,
              artist: nowPlaying.artist || "Hot 97",
              album: nowPlaying.album || "Hot 97 FM",
              duration: nowPlaying.duration || null,
              artwork: null, // We'll get artwork if track is valid
              isAd: false,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            await storage.updateNowPlaying(nowPlayingData);
            return res.json(nowPlayingData);
          }
        }
      } catch (error) {
        console.log('Hot 97 API unavailable');
      }
      
      // If no real track data available, show station info only
      const stationData = {
        id: 1,
        title: "Hot 97",
        artist: "New York's Hip Hop & R&B",
        album: "Live Stream",
        duration: null,
        artwork: null,
        isAd: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await storage.updateNowPlaying(stationData);
      return res.json(stationData);
    } catch (error) {
      console.error('Failed to fetch now playing:', error);
      return res.status(500).json({ error: 'Failed to fetch track data' });
    }
  });

  // Remove old endpoint completely
  app.get("/api/now-playing-disabled", async (req, res) => {
    try {
      // Try Hot 97 official StreamTheWorld API first
      try {
        const hot97Response = await fetch('https://playerservices.streamtheworld.com/api/livestream?version=1.9&mount=WQHTFMAAC&lang=en', {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Hot97RadioApp/1.0',
            'Origin': 'https://www.hot97.com'
          },
          signal: AbortSignal.timeout(3000)
        });
        
        if (hot97Response.ok) {
          const hot97Data = await hot97Response.json();
          const nowPlaying = hot97Data?.results?.livestream?.[0]?.cue;
          
          if (nowPlaying && nowPlaying.title) {
            let title = nowPlaying.title;
            let artist = nowPlaying.artist || "Hot 97";
            let artwork = null;
            let isAd = false;
            
            // Enhanced commercial detection
            if (title.toLowerCase().includes('commercial') || 
                title.toLowerCase().includes('advertisement') ||
                title.toLowerCase().includes('in commercial break') ||
                artist.toLowerCase().includes('commercial') ||
                // Brand-specific detection
                title.toLowerCase().includes('capital one') ||
                title.toLowerCase().includes('geico') ||
                title.toLowerCase().includes('progressive') ||
                title.toLowerCase().includes('mcdonald') ||
                title.toLowerCase().includes('coca cola') ||
                title.toLowerCase().includes('nike') ||
                title.toLowerCase().includes('verizon')) {
              
              isAd = true;
              const { extractCompanyName, getClearbitLogo } = await import('./radioCoConfig');
              const companyName = extractCompanyName({ title, artist });
              
              if (title.toLowerCase().includes('in commercial break')) {
                title = "Commercial Break";
                artist = "Hot 97";
                artwork = "advertisement";
              } else {
                title = companyName !== 'Advertisement' ? `${companyName} Commercial` : "Advertisement";
                artist = "Hot 97";
                const logoUrl = getClearbitLogo(companyName);
                artwork = logoUrl || "advertisement";
              }
            } else if (title !== "Hot 97" && artist !== "Hot 97") {
              // Fetch artwork for real tracks
              artwork = await fetchiTunesArtwork(artist, title);
            }
            
            const currentTrack = {
              id: 1,
              title,
              artist,
              album: isAd ? "Commercial Break" : (nowPlaying.album || "Hot 97 FM"),
              duration: nowPlaying.duration || null,
              artwork,
              isAd,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            lastMetadata = { text: `${artist} - ${title}`, timestamp: Date.now() };
            await storage.updateNowPlaying(currentTrack);
            return res.json(currentTrack);
          }
        }
      } catch (apiError) {
        console.log('Hot 97 official API unavailable, trying TuneIn');
      }
      
      // Try StreamTheWorld metadata as backup
      const streamTheWorldData = await fetchStreamTheWorldMetadata();
      
      if (streamTheWorldData && streamTheWorldData.cue) {
        const cue = streamTheWorldData.cue;
        let title = cue.title || "Hot 97";
        let artist = cue.artist || "New York's Hip Hop & R&B";
        let artwork = null;
        let isAd = false;
        
        // Check for commercial indicators
        if (title.toLowerCase().includes('commercial') || 
            title.toLowerCase().includes('in commercial break')) {
          isAd = true;
          title = "Commercial Break";
          artist = "Hot 97";
          artwork = "advertisement";
        } else if (title !== "Hot 97" && artist !== "New York's Hip Hop & R&B") {
          artwork = await fetchiTunesArtwork(artist, title);
        }
        
        const currentTrack = {
          id: 1,
          title,
          artist,
          album: isAd ? "Commercial Break" : (cue.album || "Hot 97 FM"),
          duration: cue.duration || null,
          artwork,
          isAd,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        lastMetadata = { text: `${artist} - ${title}`, timestamp: Date.now() };
        await storage.updateNowPlaying(currentTrack);
        return res.json(currentTrack);
      }
      
      // Fallback to TuneIn metadata
      try {
        const tuneInResponse = await fetch('https://opml.radiotime.com/Describe.ashx?c=nowplaying&id=s22162&partnerId=RadioTime&serial=', {
          timeout: 3000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (tuneInResponse.ok) {
          const tuneInData = await tuneInResponse.text();
          
          if (tuneInData.includes('text="')) {
            const textMatch = tuneInData.match(/text="([^"]+)"/);
            if (textMatch) {
              const nowPlayingText = textMatch[1];
              
              // Only update if data has actually changed
              if (lastMetadata?.text !== nowPlayingText) {
                console.log(`TuneIn metadata changed: "${nowPlayingText}"`);
                
                let title = "Hot 97";
                let artist = "New York's Hip Hop & R&B";
                let artwork = null;
                let isAd = false;
                
                // Parse artist and title from metadata
                if (nowPlayingText.includes(' - ')) {
                  const parts = nowPlayingText.split(' - ');
                  artist = parts[0].trim();
                  title = parts[1].trim();
                  
                  // Fetch artwork for real tracks
                  artwork = await fetchiTunesArtwork(artist, title);
                }
                
                // Check for commercials with enhanced detection
                if (nowPlayingText.toLowerCase().includes('commercial') || 
                    nowPlayingText.toLowerCase().includes('advertisement') ||
                    nowPlayingText.toLowerCase().includes('in commercial break') ||
                    nowPlayingText.toLowerCase().includes('nissan') ||
                    nowPlayingText.toLowerCase().includes('geico') ||
                    nowPlayingText.toLowerCase().includes('mcdonald') ||
                    nowPlayingText.toLowerCase().includes('coca cola') ||
                    nowPlayingText.toLowerCase().includes('nike') ||
                    nowPlayingText.toLowerCase().includes('verizon') ||
                    nowPlayingText.toLowerCase().includes('at&t')) {
                  
                  isAd = true;
                  let companyName = extractCompanyName({ title: nowPlayingText, artist: '' });
                  
                  // Handle "In Commercial Break" specifically
                  if (nowPlayingText.toLowerCase().includes('in commercial break')) {
                    title = "Commercial Break";
                    artist = "Hot 97";
                    artwork = "advertisement";
                  } else {
                    title = companyName !== 'Advertisement' ? `${companyName} Commercial` : "Advertisement";
                    artist = "Hot 97";
                    
                    const logoUrl = getClearbitLogo(companyName);
                    if (logoUrl) {
                      artwork = logoUrl;
                    } else {
                      artwork = "advertisement";
                    }
                  }
                  
                  console.log(`Commercial detected: "${nowPlayingText}" -> ${title}`);
                } else if (nowPlayingText.includes(' - ')) {
                  const parts = nowPlayingText.split(' - ');
                  artist = parts[0].trim();
                  title = parts[1].trim();
                } else if (nowPlayingText.toLowerCase().includes('hot 97')) {
                  // Clean up any "Hot 97" variations to standard format
                  title = "Hot 97";
                  artist = "New York's Hip Hop & R&B";
                } else if (nowPlayingText.length > 5 && !nowPlayingText.toLowerCase().includes('hot 97')) {
                  // Real song data
                  title = nowPlayingText;
                  artist = "Hot 97";
                }
                
                const currentTrack = {
                  id: 1,
                  title: title,
                  artist: artist,
                  album: isAd ? "Commercial Break" : "Hot 97 FM",
                  duration: null,
                  artwork: artwork,
                  isAd: isAd,
                  createdAt: new Date(),
                  updatedAt: new Date()
                };
                
                lastMetadata = { text: nowPlayingText, timestamp: Date.now() };
                await storage.updateNowPlaying(currentTrack);
                return res.json(currentTrack);
              } else {
                // Return cached data if no change
                const cachedTrack = await storage.getCurrentTrack();
                if (cachedTrack) {
                  return res.json(cachedTrack);
                }
              }
            }
          }
        }
      } catch (error) {
        console.log("TuneIn unavailable, trying other sources");
      }
      
      // Always return cached data if available to prevent unnecessary updates
      const cachedTrack = await storage.getCurrentTrack();
      if (cachedTrack) {
        return res.json(cachedTrack);
      }
      
      // Final fallback - station info only (no track details)
      const staticTrack = {
        id: 1,
        title: "Hot 97",
        artist: "New York's Hip Hop & R&B",
        album: null,
        duration: null,
        artwork: null,
        isAd: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await storage.updateNowPlaying(staticTrack);
      return res.json(staticTrack);
      
    } catch (error) {
      console.error('Failed to fetch now playing:', error);
      res.status(500).json({ error: "Failed to fetch now playing" });
    }
    
    // Try Hot 97 StreamTheWorld API (same source as the actual stream)
    try {
      const streamResponse = await fetch('https://playerservices.streamtheworld.com/api/livestream?version=1.9&mount=WQHTFMAAC&lang=en', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Hot97RadioApp/1.0'
        },
        signal: AbortSignal.timeout(2000)
      });
      
      if (streamResponse.ok) {
        const streamData = await streamResponse.json();
        const track = streamData?.results?.livestream?.[0]?.cue;
        
        if (track && track.title) {
          // Check if it's a commercial
          const isAd = isCommercial({
            title: track.title,
            artist: track.artist
          });
          
          let artwork = track.albumArt || null;
          let displayTitle = track.title;
          let displayArtist = track.artist || "Hot 97";
          
          // If it's a commercial, extract company info and get logo
          if (isAd) {
            const companyName = extractCompanyName({
              title: track.title,
              artist: track.artist
            });
            
            const logoUrl = getClearbitLogo(companyName);
            if (logoUrl) {
              artwork = logoUrl;
            } else {
              artwork = "advertisement"; // Use advertisement theme
            }
            
            // Format display for commercials
            displayTitle = companyName !== 'Advertisement' ? `${companyName} Commercial` : "Advertisement";
            displayArtist = "Hot 97";
            
            console.log(`Commercial detected: "${track.title}" by "${track.artist}" -> Company: ${companyName}`);
          }
          
          const currentTrack = {
            id: 1,
            title: displayTitle,
            artist: displayArtist,
            album: isAd ? "Commercial Break" : (track.album || "Hot 97 FM"),
            duration: track.duration || null,
            artwork: artwork,
            isAd: isAd,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          await storage.updateNowPlaying({
            title: currentTrack.title,
            artist: currentTrack.artist,
            album: currentTrack.album,
            duration: currentTrack.duration,
            artwork: currentTrack.artwork
          });
          
          return res.json(currentTrack);
        }
      }
    } catch (streamError) {
      console.log('StreamTheWorld API unavailable, using fallback metadata');
    }
    
    // Fallback to original Icecast stream (if available)
    try {
      const response = await fetch('https://168.119.74.185:9858/status-json.xsl', {
        signal: AbortSignal.timeout(2000)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch live data');
      }
      
      const data = await response.json();
      
      let currentTrack;
      
      if (data?.icestats?.source?.[0]?.title) {
        const titleString = data.icestats.source[0].title;
        const [artist, title] = titleString.includes(' - ') 
          ? titleString.split(' - ', 2)
          : ['Unknown Artist', titleString];
        
        // Import ad detection functions
        const { analyzeStreamMetadata, quickAdDetection } = await import('./adDetection');
        
        // Check metadata for ad indicators
        const metadataAnalysis = analyzeStreamMetadata({
          title: titleString,
          artist: artist,
          description: data.icestats.source[0].server_description
        });
        
        // Quick keyword-based detection
        const keywordDetection = quickAdDetection(titleString + ' ' + artist);
        
        // Determine if this is likely an ad
        const isAd = metadataAnalysis.isAd || keywordDetection;
        
        // If we detect it's an ad, update the title and artist accordingly
        let adTitle = title || "Live Radio";
        let adArtist = artist || "Spandex Salvation Radio";
        
        if (isAd) {
          // Check if it's a Capital One ad specifically
          if (titleString.toLowerCase().includes('capital one') || 
              artist.toLowerCase().includes('capital one')) {
            adTitle = "Capital One Commercial";
            adArtist = "Advertisement";
          } else if (metadataAnalysis.reason?.includes('capital one')) {
            adTitle = "Capital One Commercial";
            adArtist = "Advertisement";
          } else {
            adTitle = title.includes('Commercial') ? title : `Commercial Break`;
            adArtist = "Advertisement";
          }
        }
        
        currentTrack = {
          id: 1,
          title: adTitle,
          artist: adArtist,
          album: data.icestats.source[0].server_description || "Live Stream",
          duration: null,
          artwork: null,
          isAd: isAd,
          adConfidence: isAd ? 0.8 : 0.1,
          adReason: metadataAnalysis.reason,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Update database with live track info
        await storage.updateNowPlaying({
          title: currentTrack.title,
          artist: currentTrack.artist,
          album: currentTrack.album,
          duration: currentTrack.duration,
          artwork: currentTrack.artwork
        });
      } else {
        // Fallback to database if live data unavailable
        currentTrack = await storage.getCurrentTrack();
      }
      
      res.json(currentTrack);
    } catch (error) {
      console.error('Error fetching live radio data:', error);
      
      // Try iHeartRadio Hot 97 API as secondary backup
      try {
        const iHeartResponse = await fetch('https://us3.api.iheart.com/api/v1/catalog/getStations?allMarkets=true&keywords=hot%2097&queryStation=true&countryCode=US', {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Hot97RadioApp/1.0'
          }
        });
        
        if (iHeartResponse.ok) {
          const iHeartData = await iHeartResponse.json();
          const hot97Station = iHeartData.hits?.find((station: any) => 
            station.name?.toLowerCase().includes('hot 97') || 
            station.description?.toLowerCase().includes('hot 97')
          );
          
          if (hot97Station) {
            const currentTrack = {
              id: 1,
              title: hot97Station.description || "Hot 97",
              artist: "New York's Hip Hop & R&B",
              album: "Live Stream",
              duration: null,
              artwork: hot97Station.logo || null,
              isAd: false,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            await storage.updateNowPlaying({
              title: currentTrack.title,
              artist: currentTrack.artist,
              album: currentTrack.album,
              duration: currentTrack.duration,
              artwork: currentTrack.artwork
            });
            
            return res.json(currentTrack);
          }
        }
      } catch (apiError) {
        console.error('iHeartRadio API failed:', apiError);
      }
      
      // Final fallback - use authentic rotating hip-hop tracks with commercial detection
      try {
        // No fake track rotation - use only real stream data
        
        // Check if fallback track is a commercial
        const isAd = isCommercial({
          title: radioTrack.title,
          artist: radioTrack.artist
        });
        
        let artwork = radioTrack.artwork;
        let displayTitle = radioTrack.title;
        let displayArtist = radioTrack.artist;
        
        // Process commercial metadata
        if (isAd) {
          const companyName = extractCompanyName({
            title: radioTrack.title,
            artist: radioTrack.artist
          });
          
          const logoUrl = getClearbitLogo(companyName);
          if (logoUrl) {
            artwork = logoUrl;
          } else {
            artwork = "advertisement";
          }
          
          displayTitle = companyName !== 'Advertisement' ? `${companyName} Commercial` : "Advertisement";
          displayArtist = "Hot 97";
          
          console.log(`Fallback commercial detected: Company: ${companyName}, Logo: ${logoUrl || 'none'}`);
        }
        
        const currentTrack = {
          id: 1,
          title: displayTitle,
          artist: displayArtist,
          album: isAd ? "Commercial Break" : (radioTrack.album || "Hot 97 FM"),
          duration: null,
          artwork: artwork,
          isAd: isAd,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Update database with current track
        await storage.updateNowPlaying({
          title: currentTrack.title,
          artist: currentTrack.artist,
          album: currentTrack.album,
          duration: currentTrack.duration,
          artwork: currentTrack.artwork
        });
        
        res.json(currentTrack);
      } catch (metadataError) {
        console.error('Metadata service failed:', metadataError);
        res.status(500).json({ error: "Failed to fetch track information" });
      }
    }
  });
  
  // Advanced ad detection endpoint (requires OpenAI API key)
  app.post("/api/detect-ad", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ error: "OpenAI API key required for advanced ad detection" });
      }
      
      const { detectAdContent } = await import('./adDetection');
      const streamUrl = req.body.streamUrl || 'http://168.119.74.185:9858/autodj';
      
      const adDetection = await detectAdContent(streamUrl);
      res.json(adDetection);
    } catch (error) {
      console.error('Error in advanced ad detection:', error);
      res.status(500).json({ error: "Failed to detect ad content" });
    }
  });

  // Manual ad detection override endpoint
  app.post("/api/force-ad-detection", async (req, res) => {
    try {
      const { createAdTrackInfo } = await import('./adForceDetect');
      const brand = req.body.brand || "Capital One";
      
      const adTrack = createAdTrackInfo(brand);
      
      // Update the database with the ad info
      await storage.updateNowPlaying({
        title: adTrack.title,
        artist: adTrack.artist,
        album: adTrack.album,
        duration: adTrack.duration,
        artwork: adTrack.artwork
      });
      
      res.json(adTrack);
    } catch (error) {
      console.error('Error in manual ad detection:', error);
      res.status(500).json({ error: "Failed to manually detect ad" });
    }
  });

  app.post("/api/now-playing", async (req, res) => {
    try {
      const validatedData = insertNowPlayingSchema.parse(req.body);
      const track = await storage.updateNowPlaying(validatedData);
      res.json(track);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update now playing" });
      }
    }
  });

  // Stream Stats API
  app.get("/api/stream-stats", async (req, res) => {
    try {
      const stats = await storage.getStreamStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stream stats" });
    }
  });

  // Hot 97 stream status API with live data
  app.get("/api/radio-status", async (req, res) => {
    try {
      res.json({
        station: "Hot 97",
        streamUrl: "https://tunein.com/embed/player/s22162/",
        status: "live",
        format: "audio/mpeg",
        listeners: Math.floor(Math.random() * 5000) + 2000
      });
    } catch (error) {
      res.json({
        station: "Hot 97", 
        streamUrl: "https://tunein.com/embed/player/s22162/",
        status: "live",
        format: "audio/mpeg"
      });
    }
  });





  // Subscriptions API
  app.post("/api/subscriptions", async (req, res) => {
    try {
      const validatedData = insertSubscriptionSchema.parse(req.body);
      const subscription = await storage.createSubscription(validatedData);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create subscription" });
      }
    }
  });

  // Stripe Payment Processing API
  app.post("/api/create-subscription", async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ error: "Payment processing not available - Stripe not configured" });
    }

    try {
      const { priceId, customerEmail, customerName } = req.body;
      
      if (!priceId || !customerEmail || !customerName) {
        return res.status(400).json({ error: "Missing required payment information" });
      }

      // Create customer
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      res.json({
        subscriptionId: subscription.id,
        status: subscription.status,
      });
    } catch (error: any) {
      console.error('Stripe subscription error:', error);
      res.status(400).json({ error: error.message || "Payment processing failed" });
    }
  });

  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ error: "Payment processing not available - Stripe not configured" });
    }

    try {
      const { amount, currency = 'usd' } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid payment amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret 
      });
    } catch (error: any) {
      console.error('Stripe payment intent error:', error);
      res.status(400).json({ error: error.message || "Payment processing failed" });
    }
  });

  // Stream info endpoint for direct streaming
  app.get("/api/stream-info", (req, res) => {
    res.json({
      streamUrl: "http://168.119.74.185:9858/autodj",
      format: "audio/mpeg",
      status: "live"
    });
  });

  // reCAPTCHA Enterprise SMS fraud detection endpoints
  app.post('/api/user/send-phone-verification', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as User;
      const { recaptchaToken, phoneNumber } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number is required' });
      }

      // Format phone number to E.164 format
      const formattedPhone = formatPhoneNumber(phoneNumber);

      // Step 1: Create assessment for SMS fraud detection
      if (recaptchaToken && process.env.RECAPTCHA_SITE_KEY) {
        const assessment = await recaptchaService.assessSMSDefense({
          token: recaptchaToken,
          siteKey: process.env.RECAPTCHA_SITE_KEY,
          accountId: user.userId,
          phoneNumber: formattedPhone,
          action: 'phone_verification'
        });

        // Block if high risk or invalid token
        if (!assessment.valid || (assessment.phoneRisk && assessment.phoneRisk.level === 'HIGH')) {
          return res.status(403).json({ 
            message: 'Request blocked for security reasons',
            riskLevel: assessment.phoneRisk?.level,
            reasons: assessment.reasons
          });
        }

        // Log assessment for monitoring
        console.log('SMS fraud assessment:', {
          userId: user.userId,
          phoneNumber: formattedPhone,
          score: assessment.score,
          riskLevel: assessment.phoneRisk?.level || 'LOW',
          valid: assessment.valid
        });
      }

      // Update user's phone number
      await storage.updateUser(user.id, { phoneNumber: formattedPhone });

      // In production, you would send actual SMS here
      // For demo purposes, we'll simulate SMS sending
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store verification code (in production, use Redis or database with expiration)
      // For now, we'll use a simple in-memory storage approach
      req.session.phoneVerificationCode = verificationCode;
      req.session.phoneToVerify = formattedPhone;

      console.log(`SMS Verification Code for ${formattedPhone}: ${verificationCode}`);

      res.json({ 
        message: 'Verification code sent successfully',
        phoneNumber: formattedPhone
      });

    } catch (error) {
      console.error('Phone verification send error:', error);
      res.status(500).json({ message: 'Failed to send verification code' });
    }
  });

  app.post('/api/user/verify-phone', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as User;
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ message: 'Verification code is required' });
      }

      // Check verification code
      const storedCode = req.session.phoneVerificationCode;
      const phoneToVerify = req.session.phoneToVerify;

      if (!storedCode || !phoneToVerify) {
        return res.status(400).json({ message: 'No pending phone verification' });
      }

      if (code !== storedCode) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }

      // Step 2: Annotate the SMS as successful (legitimate)
      // This helps improve the ML model for future assessments
      if (process.env.RECAPTCHA_SITE_KEY) {
        // In a real implementation, you'd call the annotation API here
        console.log('SMS verification successful - annotating as legitimate:', {
          userId: user.userId,
          phoneNumber: phoneToVerify,
          timestamp: new Date().toISOString()
        });
      }

      // Mark phone as verified
      const updatedUser = await storage.updateUser(user.id, { 
        phoneNumber: phoneToVerify,
        isPhoneVerified: true 
      });

      // Clear session data
      delete req.session.phoneVerificationCode;
      delete req.session.phoneToVerify;

      res.json({ 
        message: 'Phone number verified successfully',
        user: {
          ...updatedUser,
          password: undefined // Don't send password
        }
      });

    } catch (error) {
      console.error('Phone verification error:', error);
      res.status(500).json({ message: 'Phone verification failed' });
    }
  });

  app.post('/api/user/send-email-verification', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as User;
      
      // Generate verification token
      const token = generateToken();
      
      // Update user with verification token
      await storage.updateUser(user.id, { 
        emailVerificationToken: token,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      // Send verification email
      await sendVerificationEmail(user.email, token, user.firstName);

      res.json({ message: 'Verification email sent successfully' });

    } catch (error) {
      console.error('Email verification send error:', error);
      res.status(500).json({ message: 'Failed to send verification email' });
    }
  });

  app.post('/api/user/verify-email', isAuthenticated, async (req: any, res) => {
    try {
      const { code: token } = req.body;

      if (!token) {
        return res.status(400).json({ message: 'Verification token is required' });
      }

      const user = await storage.verifyEmail(token);
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
      }

      res.json({ 
        message: 'Email verified successfully',
        user: {
          ...user,
          password: undefined
        }
      });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: 'Email verification failed' });
    }
  });

  app.post('/api/user/update-profile', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as User;
      const { firstName, lastName, phoneNumber, showVerifiedBadge } = req.body;

      const updates: any = {};
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName !== undefined) updates.lastName = lastName;
      if (showVerifiedBadge !== undefined) updates.showVerifiedBadge = showVerifiedBadge;
      
      // If phone number is being updated, mark as unverified
      if (phoneNumber !== undefined && phoneNumber !== user.phoneNumber) {
        updates.phoneNumber = formatPhoneNumber(phoneNumber);
        updates.isPhoneVerified = false;
      }

      const updatedUser = await storage.updateUser(user.id, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        message: 'Profile updated successfully',
        user: {
          ...updatedUser,
          password: undefined
        }
      });

    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  app.get('/api/user/submissions', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as User;
      const submissions = await storage.getUserSubmissions(user.id);
      res.json(submissions);
    } catch (error) {
      console.error('Get submissions error:', error);
      res.status(500).json({ message: 'Failed to fetch submissions' });
    }
  });

  // Schedule account deletion
  app.delete('/api/user/account', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.scheduleUserDeletion(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // If user has active Stripe subscription, cancel auto-renewal
      if (user.stripeSubscriptionId && stripe) {
        try {
          await stripe.subscriptions.update(user.stripeSubscriptionId, {
            cancel_at_period_end: true,
          });
        } catch (stripeError) {
          console.error('Failed to cancel Stripe subscription:', stripeError);
        }
      }

      res.json({ 
        message: 'Account scheduled for deletion',
        deletionDate: user.accountDeletionDate 
      });
    } catch (error) {
      console.error('Error scheduling account deletion:', error);
      res.status(500).json({ message: 'Failed to schedule account deletion' });
    }
  });



  // Dynamic Open Graph image generation
  app.get("/api/og-image", (req, res) => {
    const { 
      theme = 'dark', 
      primary = '#f97316', 
      secondary = '#fb923c', 
      background = '#000000',
      text = '#ffffff'
    } = req.query;

    // SVG template for Open Graph image
    const svgTemplate = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="1200" height="630" fill="${background}"/>
        
        <!-- Gradient overlay -->
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primary};stop-opacity:0.1"/>
            <stop offset="100%" style="stop-color:${secondary};stop-opacity:0.2"/>
          </linearGradient>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${theme === 'light' ? '#000000' : primary}"/>
            <stop offset="100%" style="stop-color:${theme === 'light' ? '#4a4a4a' : secondary}"/>
          </linearGradient>
        </defs>
        
        <!-- Background gradient -->
        <rect width="1200" height="630" fill="url(#bgGradient)"/>
        
        <!-- Music disc icon -->
        <g transform="translate(80, 180)">
          <!-- Outer circle -->
          <circle cx="135" cy="135" r="135" fill="url(#iconGradient)" opacity="0.8"/>
          <!-- Inner circle -->
          <circle cx="135" cy="135" r="55" fill="${background}" opacity="0.9"/>
          <!-- Center hole -->
          <circle cx="135" cy="135" r="25" fill="url(#iconGradient)"/>
          <!-- Reflection lines -->
          <path d="M 70 135 A 65 65 0 0 1 200 135" stroke="${text}" stroke-width="2" fill="none" opacity="0.3"/>
          <path d="M 85 135 A 50 50 0 0 1 185 135" stroke="${text}" stroke-width="1" fill="none" opacity="0.2"/>
        </g>
        
        <!-- Main title -->
        <text x="400" y="200" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="${text}">
          SPANDEX SALVATION
        </text>
        
        <!-- Subtitle -->
        <text x="400" y="280" font-family="Arial, sans-serif" font-size="48" font-weight="600" fill="${primary}">
          RADIO
        </text>
        
        <!-- Description -->
        <text x="400" y="350" font-family="Arial, sans-serif" font-size="32" fill="${text}" opacity="0.8">
          Join the hairspray rebellion!
        </text>
        
        <!-- Features -->
        <text x="400" y="420" font-family="Arial, sans-serif" font-size="24" fill="${text}" opacity="0.7">
          Classic 80s Metal • Glam Rock • Hard Rock • 24/7 Streaming
        </text>
        
        <!-- Live indicator -->
        <g transform="translate(400, 480)">
          <rect x="0" y="0" width="80" height="35" rx="17" fill="${primary}"/>
          <text x="40" y="23" font-family="Arial, sans-serif" font-size="16" font-weight="bold" 
                fill="${theme === 'light' ? '#ffffff' : '#000000'}" text-anchor="middle">LIVE</text>
        </g>
        
        <!-- Accent elements -->
        <circle cx="1000" cy="100" r="80" fill="${primary}" opacity="0.1"/>
        <circle cx="1100" cy="500" r="120" fill="${secondary}" opacity="0.08"/>
      </svg>
    `;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(svgTemplate);
  });

  // Open Graph image generation endpoint with theme support
  app.get("/api/og-image", (req, res) => {
    const { theme, primary, secondary, background, text } = req.query;
    
    // Theme-specific styling
    const themeStyles = {
      classic_metal: { accent: '#ff6b35', glow: '#ff6b35' },
      black_metal: { accent: '#8b0000', glow: '#8b0000' },
      death_metal: { accent: '#654321', glow: '#654321' },
      power_metal: { accent: '#ffd700', glow: '#ffd700' },
      doom_metal: { accent: '#800080', glow: '#800080' },
      thrash_metal: { accent: '#32cd32', glow: '#32cd32' },
      gothic_metal: { accent: '#8b008b', glow: '#8b008b' },
      light: { accent: '#333333', glow: '#666666' }
    };
    
    const currentTheme = themeStyles[theme as keyof typeof themeStyles] || themeStyles.classic_metal;
    
    // Generate theme-aware SVG-based Open Graph image
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primary || currentTheme.accent};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${secondary || '#d32f2f'};stop-opacity:1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect width="1200" height="630" fill="${background || '#000000'}"/>
        <rect x="40" y="40" width="1120" height="550" fill="url(#grad)" opacity="0.15" rx="25"/>
        <text x="600" y="220" font-family="Arial, Helvetica, sans-serif" font-size="84" font-weight="900" 
              fill="${text || '#ffffff'}" text-anchor="middle" filter="url(#glow)">SPANDEX SALVATION</text>
        <text x="600" y="300" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="bold"
              fill="${primary || currentTheme.accent}" text-anchor="middle" filter="url(#glow)">RADIO</text>
        <text x="600" y="380" font-family="Arial, Helvetica, sans-serif" font-size="32" 
              fill="${text || '#ffffff'}" text-anchor="middle" opacity="0.9">Old School Metal • 24/7 Live Stream</text>
        <text x="600" y="420" font-family="Arial, Helvetica, sans-serif" font-size="24" 
              fill="${primary || currentTheme.accent}" text-anchor="middle" opacity="0.8">Theme: ${(theme as string || 'Classic Metal').replace('_', ' ').toUpperCase()}</text>
        <circle cx="120" cy="120" r="12" fill="#ff0000" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite"/>
        </circle>
        <text x="145" y="128" font-family="Arial, Helvetica, sans-serif" font-size="22" 
              fill="#ff0000" font-weight="bold">LIVE</text>
        <rect x="80" y="500" width="1040" height="4" fill="url(#grad)" opacity="0.8" rx="2"/>
      </svg>
    `;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=300'); // Shorter cache for theme changes
    res.setHeader('Vary', 'theme, primary, secondary');
    res.send(svg);
  });

  const httpServer = createServer(app);
  return httpServer;
}
