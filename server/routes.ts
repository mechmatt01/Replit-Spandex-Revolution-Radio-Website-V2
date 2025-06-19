import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupPassport, isAuthenticated, isAdmin, hashPassword, generateToken, sendVerificationEmail } from "./auth";
import passport from "passport";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import { registerUserSchema, loginUserSchema } from "@shared/schema";
import https from "https";
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

  // Authentication API routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password and generate verification token
      const hashedPassword = await hashPassword(validatedData.password);
      const emailVerificationToken = generateToken();

      // Create user
      const user = await storage.createUser({
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        password: hashedPassword,
      });

      // Update with verification token
      await storage.updateUser(user.id, {
        emailVerificationToken,
      });

      // Send verification email
      await sendVerificationEmail(user.email, emailVerificationToken, user.firstName);

      res.status(201).json({ 
        message: "Registration successful! Please check your email to verify your account.",
        userId: user.id 
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    const user = req.user as User;
    res.json({ 
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionTier: user.subscriptionTier,
      }
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/user", isAuthenticated, (req, res) => {
    const user = req.user as User;
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionTier: user.subscriptionTier,
      isEmailVerified: user.isEmailVerified,
    });
  });

  // Google OAuth routes
  app.get("/api/auth/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect("/");
    }
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

  // Now Playing API
  app.get("/api/now-playing", async (req, res) => {
    try {
      const track = await storage.getCurrentTrack();
      res.json(track);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch current track" });
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

  // Radio.co stream status API with live data
  app.get("/api/radio-status", async (req, res) => {
    try {
      // Try to get KPRS stream info from radio.co API
      const response = await fetch("https://public.radio.co/stations/s8b64325e5/status");
      if (response.ok) {
        const data = await response.json();
        res.json({
          station: "KPRS Radio",
          streamUrl: "https://streamer.radio.co/s8b64325e5/listen",
          status: "live",
          format: "audio/mpeg",
          currentTrack: data.current_track || null,
          listeners: data.listeners || 0
        });
      } else {
        // Fallback with direct KPRS stream URL
        res.json({
          station: "KPRS Radio",
          streamUrl: "https://streamer.radio.co/s8b64325e5/listen",
          status: "live",
          format: "audio/mpeg"
        });
      }
    } catch (error) {
      // Ultimate fallback
      res.json({
        station: "KPRS Radio",
        streamUrl: "https://streamer.radio.co/s8b64325e5/listen",
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
