import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'https://spandex-salvation-radio-site.web.app'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Stripe subscription check endpoint
app.post('/api/check-subscription', async (req, res) => {
  try {
    const { firebaseUID, email } = req.body;
    
    if (!firebaseUID) {
      return res.status(400).json({
        success: false,
        error: 'Firebase UID is required'
      });
    }

    // For now, return mock data since we don't have Stripe fully integrated
    // In production, this would check actual Stripe subscriptions
    console.log(`Checking subscription for user: ${firebaseUID} (${email})`);
    
    // Mock subscription status - you can modify this for testing
    // For the test user, return true to show premium features
    const hasActiveSubscription = firebaseUID === 'test-user-123' ? true : false;
    
    res.json({
      success: true,
      hasActiveSubscription,
      firebaseUID,
      email,
      subscriptionDetails: hasActiveSubscription ? {
        status: 'active',
        plan: 'premium',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      } : null,
      note: 'Mock data - integrate with actual Stripe API in production'
    });
    
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Import Stripe (mock for now, but structured for real integration)
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key');

// Create Stripe customer
app.post('/api/stripe/create-customer', async (req, res) => {
  try {
    const { email, name, firebaseUID } = req.body;
    
    if (!email || !firebaseUID) {
      return res.status(400).json({
        success: false,
        error: 'Email and Firebase UID are required'
      });
    }

    // In production, this would create a real Stripe customer
    const customer = {
      id: `cus_${firebaseUID}_${Date.now()}`,
      email,
      name,
      metadata: { firebaseUID }
    };

    res.json({
      success: true,
      customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create customer'
    });
  }
});

// Create subscription
app.post('/api/stripe/create-subscription', async (req, res) => {
  try {
    const { customerId, priceId, paymentMethodId } = req.body;
    
    if (!customerId || !priceId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and Price ID are required'
      });
    }

    // In production, this would create a real Stripe subscription
    const subscription = {
      id: `sub_${Date.now()}`,
      customer: customerId,
      status: 'active',
      current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
      items: {
        data: [{
          id: `si_${Date.now()}`,
          price: {
            id: priceId,
            amount: priceId.includes('rebel') ? 599 : priceId.includes('legend') ? 1299 : 2499,
            currency: 'usd'
          }
        }]
      }
    };

    res.json({
      success: true,
      subscription,
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription'
    });
  }
});

// Get customer subscriptions
app.get('/api/stripe/customer-subscriptions/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Mock subscriptions data
    const subscriptions = [];
    
    res.json({
      success: true,
      subscriptions
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscriptions'
    });
  }
});

// Cancel subscription
app.post('/api/stripe/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'Subscription ID is required'
      });
    }

    // Mock cancellation
    res.json({
      success: true,
      subscription: {
        id: subscriptionId,
        status: 'canceled',
        canceled_at: Math.floor(Date.now() / 1000)
      }
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription'
    });
  }
});

// Create payment intent for merchandise
app.post('/api/stripe/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', customerId, metadata = {} } = req.body;
    
    if (!amount || amount < 50) { // Minimum $0.50
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least $0.50'
      });
    }

    // Mock payment intent
    const paymentIntent = {
      id: `pi_${Date.now()}`,
      amount,
      currency,
      status: 'requires_payment_method',
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      metadata
    };

    res.json({
      success: true,
      paymentIntent
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent'
    });
  }
});

// Confirm payment
app.post('/api/stripe/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment Intent ID is required'
      });
    }

    // Mock payment confirmation
    res.json({
      success: true,
      paymentIntent: {
        id: paymentIntentId,
        status: 'succeeded',
        amount_received: 599 // Mock amount
      }
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment'
    });
  }
});

// Get Stripe Products (Subscriptions and Merchandise)
app.get('/api/stripe/products', async (req, res) => {
  try {
    const { type } = req.query; // 'subscription' or 'merchandise' or 'all'
    
    let products = Object.values(STRIPE_PRODUCTS);
    
    if (type && type !== 'all') {
      products = products.filter(product => product.type === type);
    }
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching Stripe products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get specific Stripe product by ID
app.get('/api/stripe/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = Object.values(STRIPE_PRODUCTS).find(p => p.productId === productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error fetching Stripe product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Update Stripe product (for admin editing)
app.put('/api/stripe/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const updates = req.body;
    
    // Find the product key
    const productKey = Object.keys(STRIPE_PRODUCTS).find(key => 
      STRIPE_PRODUCTS[key].productId === productId
    );
    
    if (!productKey) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Update the product (in a real app, this would update Stripe and Firebase)
    STRIPE_PRODUCTS[productKey] = {
      ...STRIPE_PRODUCTS[productKey],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      product: STRIPE_PRODUCTS[productKey]
    });
  } catch (error) {
    console.error('Error updating Stripe product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Stripe webhook endpoint
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // In production, verify webhook signature
    // event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    
    // For now, mock the event
    event = req.body;
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object);
        break;
      case 'customer.subscription.created':
        console.log('Subscription created:', event.data.object);
        break;
      case 'customer.subscription.updated':
        console.log('Subscription updated:', event.data.object);
        break;
      case 'customer.subscription.deleted':
        console.log('Subscription deleted:', event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Simple admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Check against hardcoded credentials for local testing
    if (username === 'adminAccess' && password === 'password123') {
      res.json({
        success: true,
        message: 'Admin access granted'
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid admin credentials'
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    directory: __dirname,
    cwd: process.cwd()
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    endpoints: {
      health: '/health',
      nowPlaying: '/api/now-playing',
      radioStream: '/api/radio-stream'
    }
  });
});

// Radio stream proxy endpoint
app.get('/api/radio-stream', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log(`Proxying radio stream from: ${url}`);

    // Set headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Proxy the audio stream
    const fetch = (await import('node-fetch')).default;
    const streamResponse = await fetch(url);
    
    if (!streamResponse.ok) {
      throw new Error(`HTTP ${streamResponse.status}`);
    }

    // Pipe the audio stream to the response
    streamResponse.body.pipe(res);
  } catch (error) {
    console.error('Radio stream proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy radio stream' });
  }
});

// Real SomaFM metadata fetcher
async function fetchSomaFMMetadata(channel) {
  try {
    console.log(`Fetching real SomaFM metadata for channel: ${channel}`);
    
    const fetch = (await import('node-fetch')).default;
    
    // Try SomaFM's JSON API
    const response = await fetch(`https://somafm.com/songs/${channel}.json`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`SomaFM response data:`, JSON.stringify(data, null, 2));
      
      const track = data.songs?.[0];
      
      if (track && track.title) {
        // Try to get artwork from multiple possible fields
        let artwork = track.albumArt || track.image || track.artwork || '';
        
        // Get genre information for the channel
        const channelGenres = {
          'metal': 'Metal',
          'dronezone': 'Ambient',
          'groovesalad': 'Ambient',
          'secretagent': 'Jazz',
          'sonic': 'Electronic',
          'illstreet': 'Jazz',
          '7soul': 'Soul',
          'bagel': 'Jazz',
          'cliqhop': 'Electronic',
          'dubstep': 'Electronic',
          'forest': 'Ambient',
          'indiepop': 'Indie',
          'jolly': 'Alternative',
          'lush': 'Ambient',
          'missioncontrol': 'Space',
          'n5md': 'Electronic',
          'poptron': 'Electronic',
          'sf1033': 'Alternative',
          'spacestation': 'Space'
        };
        
        const genre = channelGenres[channel] || 'Various';
        
        // If no artwork provided, search for real album artwork first, then fallback to themed
        if (!artwork || artwork.trim() === '') {
          artwork = await generateFallbackArtwork(track.artist, track.album, track.title, genre);
        }
        
        // Enhanced ad detection using AI
        const { detectAdvertisement } = await import('./adDetection.js');
        const adDetection = await detectAdvertisement(track.title, track.artist, track.album, `SomaFM ${channel}`);
        
        console.log(`Ad detection result:`, adDetection);
        
        const metadata = {
          title: track.title || 'Unknown Track',
          artist: track.artist || 'Unknown Artist',
          album: track.album || 'Unknown Album',
          artwork: artwork,
          stationName: `SomaFM ${channel.charAt(0).toUpperCase() + channel.slice(1)}`,
          timestamp: Date.now(),
          genre: genre,
          isAd: adDetection.isAd,
          adType: adDetection.adType,
          adCompany: adDetection.brandName,
          adReason: adDetection.reason,
          confidence: adDetection.confidence
        };
        
        console.log(`Successfully extracted SomaFM metadata:`, metadata);
        return metadata;
      }
    }
    
    console.log(`SomaFM API failed for channel ${channel}`);
    return null;
  } catch (error) {
    console.error(`SomaFM metadata fetch failed for ${channel}:`, error);
    return null;
  }
}

// Fallback artwork generator - now searches for real album covers
async function generateFallbackArtwork(artist, album, title, genre) {
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Try to find real album artwork using iTunes Search API (free, no API key required)
    let searchTerm = '';
    if (album && album.trim() && album !== 'Unknown Album') {
      searchTerm = `${artist} ${album}`;
    } else if (title && title.trim() && title !== 'Unknown Track') {
      searchTerm = `${artist} ${title}`;
    } else {
      searchTerm = artist;
    }
    
    if (searchTerm.trim()) {
      const encodedSearch = encodeURIComponent(searchTerm);
      const itunesUrl = `https://itunes.apple.com/search?term=${encodedSearch}&entity=album,song&limit=1`;
      
      console.log(`Searching iTunes for artwork: ${searchTerm}`);
      
      const response = await fetch(itunesUrl);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        if (result.artworkUrl100) {
          // Convert 100x100 to 300x300 for better quality
          const artworkUrl = result.artworkUrl100.replace('100x100', '300x300');
          console.log(`Found real album artwork: ${artworkUrl}`);
          return artworkUrl;
        }
      }
    }
    
    // If no real artwork found, generate themed artwork as fallback
    console.log(`No real artwork found, generating themed artwork for: ${searchTerm}`);
    return generateThemedArtwork(artist, album, title, genre);
    
  } catch (error) {
    console.warn('Album artwork search failed:', error);
    // Return themed artwork as fallback
    return generateThemedArtwork(artist, album, title, genre);
  }
}

// Generate themed artwork based on artist/album/title and genre
function generateThemedArtwork(artist, album, title, genre = 'metal') {
  // Create a unique hash for consistent artwork per track
  const hash = simpleHash(`${artist}${album}${title}`);
  
  // Genre-specific color schemes
  const genreColors = {
    'metal': ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
    'ambient': ['#A8E6CF', '#DCEDC1', '#FFD3B6', '#FFAAA5', '#FF8B94'],
    'jazz': ['#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'],
    'electronic': ['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
    'soul': ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
    'indie': ['#A8E6CF', '#DCEDC1', '#FFD3B6', '#FFAAA5', '#FF8B94'],
    'hip hop': ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
    'default': ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
  };
  
  const colors = genreColors[genre.toLowerCase()] || genreColors.default;
  const color = colors[hash % colors.length];
  const secondaryColor = colors[(hash + 1) % colors.length];
  
  // Genre-specific icons
  const genreIcons = {
    'metal': '🤘',
    'ambient': '🌌',
    'jazz': '🎷',
    'electronic': '🎧',
    'soul': '💿',
    'indie': '🎸',
    'hip hop': '🎤',
    'default': '🎵'
  };
  
  const icon = genreIcons[genre.toLowerCase()] || genreIcons.default;
  
  // Generate a themed SVG artwork
  const svg = `
    <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill="url(#grad)"/>
      <text x="150" y="120" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">${icon}</text>
      <text x="150" y="150" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">${artist.substring(0, 15)}</text>
      <text x="150" y="170" text-anchor="middle" fill="white" font-family="Arial" font-size="12">${album ? album.substring(0, 20) : title.substring(0, 20)}</text>
      <text x="150" y="190" text-anchor="middle" fill="white" font-family="Arial" font-size="10" opacity="0.8">${genre.toUpperCase()}</text>
    </svg>
  `;
  
  // Convert SVG to data URL
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  return dataUrl;
}

// Simple hash function for consistent artwork generation
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Now Playing API with real metadata fetcher
app.get('/api/now-playing', async (req, res) => {
  try {
    const stationId = req.query.station || "somafm-metal"; // Default to SomaFM Metal

    console.log(`Fetching now playing for station: ${stationId}`);

    // Comprehensive station mapping for all radio stations
    const stationMap = {
      // SomaFM Stations
      'somafm-metal': 'metal',
      'somafm-dronezone': 'dronezone',
      'somafm-groovesalad': 'groovesalad',
      'somafm-secretagent': 'secretagent',
      'somafm-sonic': 'sonic',
      'somafm-illstreet': 'illstreet',
      'somafm-7soul': '7soul',
      'somafm-bagel': 'bagel',
      'somafm-cliqhop': 'cliqhop',
      'somafm-dubstep': 'dubstep',
      'somafm-forest': 'forest',
      'somafm-indiepop': 'indiepop',
      'somafm-jolly': 'jolly',
      'somafm-lush': 'lush',
      'somafm-missioncontrol': 'missioncontrol',
      'somafm-n5md': 'n5md',
      'somafm-poptron': 'poptron',
      'somafm-sf1033': 'sf1033',
      'somafm-spacestation': 'spacestation',
      
      // Legacy mappings for backward compatibility
      'metal': 'metal',
      // Real radio stations - these don't have SomaFM metadata
      'hot-97': 'real-radio',
      'hot-105': 'real-radio', 
      'q-93': 'real-radio',
      'beat-955': 'real-radio',
      'power-106': 'real-radio'
    };

    const channel = stationMap[stationId];
    
    // Handle real radio stations (Hot 97, Power 106, etc.)
    if (channel === 'real-radio') {
      console.log(`Real radio station detected: ${stationId}`);
      
      // Station-specific metadata mapping
      const stationMetadata = {
        'hot-97': {
          name: "Hot 97",
          frequency: "97.1 FM",
          location: "New York, NY",
          genre: "Hip Hop & R&B"
        },
        'power-106': {
          name: "Power 105.1",
          frequency: "105.1 FM", 
          location: "New York, NY",
          genre: "Hip Hop & R&B"
        },
        'beat-955': {
          name: "95.5 The Beat",
          frequency: "95.5 FM",
          location: "Dallas, TX", 
          genre: "Hip Hop & R&B"
        },
        'hot-105': {
          name: "Hot 105",
          frequency: "105.1 FM",
          location: "Miami, FL",
          genre: "Urban R&B"
        },
        'q-93': {
          name: "Q93",
          frequency: "93.3 FM",
          location: "New Orleans, LA",
          genre: "Hip Hop & R&B"
        }
      };
      
      const metadata = stationMetadata[stationId] || stationMetadata['hot-97'];
      
              // Generate appropriate metadata for real radio stations
        const nowPlayingData = {
          id: Date.now(),
          title: "Live Radio",
          artist: metadata.name,
          album: `${metadata.frequency} ${metadata.location}`,
          isLive: true,
          timestamp: new Date().toISOString(),
          artwork: "real-radio",
          stationId,
          stationName: metadata.name,
          frequency: metadata.frequency,
          location: metadata.location,
          genre: metadata.genre,
          isAd: false,
          adType: 'radio',
          adCompany: null,
          adReason: 'Live radio broadcast',
          confidence: 1.0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

      console.log(`Now playing: Live radio on ${nowPlayingData.stationName}`);
      return res.json(nowPlayingData);
    }
    
    if (!channel) {
      console.log(`Unknown station ID: ${stationId}, defaulting to metal`);
      // Default to metal if station not found
      const metadata = await fetchSomaFMMetadata('metal');

      // Create the response with real metadata
      const nowPlayingData = {
        id: Date.now(),
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album,
        isLive: true,
        timestamp: new Date(metadata.timestamp).toISOString(),
        artwork: metadata.artwork,
        stationId,
        stationName: metadata.stationName,
        frequency: "Online",
        location: "San Francisco, CA",
        genre: "Heavy Metal & Hard Rock",
        isAd: metadata.isAd,
        adType: metadata.adType,
        adCompany: metadata.adCompany,
        adReason: metadata.adReason,
        confidence: metadata.confidence,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log(`Now playing: "${metadata.title}" by ${metadata.artist} on ${metadata.stationName}`);
      return res.json(nowPlayingData);
    }

    const metadata = await fetchSomaFMMetadata(channel);

    if (!metadata) {
      console.log(`No metadata found for station: ${stationId}`);
      return res.status(404).json({ error: 'No metadata available for this station' });
    }

    // Create the response with real metadata
    const nowPlayingData = {
      id: Date.now(),
      title: metadata.title,
      artist: metadata.artist,
      album: metadata.album,
      isLive: true,
      timestamp: new Date(metadata.timestamp).toISOString(),
      artwork: metadata.artwork,
      stationId,
      stationName: metadata.stationName,
      frequency: "Online",
      location: "San Francisco, CA",
      genre: metadata.genre || "Various",
      isAd: metadata.isAd,
      adType: metadata.adType,
      adCompany: metadata.adCompany,
      adReason: metadata.adReason,
      confidence: metadata.confidence,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log(`Now playing: "${metadata.title}" by ${metadata.artist} on ${metadata.stationName}`);
    return res.json(nowPlayingData);
  } catch (error) {
    console.error("Failed to fetch track data:", error);
    return res.status(500).json({ error: 'Failed to fetch now playing data' });
  }
});

// Stream stats API endpoint with fallback data
app.get('/api/stream-stats', async (req, res) => {
  try {
    // Return fallback stream stats for offline mode
    const streamStats = {
      activeListeners: 42 + Math.floor(Math.random() * 10),
      countries: 12 + Math.floor(Math.random() * 3),
      totalListeners: 1247 + Math.floor(Math.random() * 50),
      timestamp: new Date().toISOString(),
      note: 'Fallback data (offline mode)'
    };

    console.log('Stream stats updated:', streamStats);
    res.json(streamStats);
  } catch (error) {
    console.error('Error fetching stream stats:', error);
    // Return fallback values on error
    res.json({
      activeListeners: 42,
      countries: 12,
      totalListeners: 1247,
      timestamp: new Date().toISOString(),
      note: 'Fallback data (error occurred)'
    });
  }
});

// Submissions API endpoint with fallback data
app.get('/api/submissions', async (req, res) => {
  try {
    // Return empty submissions for offline mode
    res.json([]);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Firebase Firestore setup for dynamic data
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

// Initialize Firebase (use your config)
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: process.env.FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Stripe Product IDs from your images
const STRIPE_PRODUCTS = {
  // Subscription Products
  rebel: {
    productId: 'prod_SYtaAhwYUbBRCN',
    priceId: 'price_rebel_monthly',
    name: 'Rebel',
    description: 'This is for the Rebel Subscription Package',
    price: 10.00,
    type: 'subscription',
    features: [
      'Ad-free streaming experience',
      'High-quality audio (320kbps)',
      'Monthly exclusive playlist',
      'Priority song requests',
    ]
  },
  legend: {
    productId: 'prod_SYtb33Yg1ISFTP',
    priceId: 'price_legend_monthly',
    name: 'Legend',
    description: 'This is for the Legend Subscription',
    price: 15.00,
    type: 'subscription',
    features: [
      'Everything in Rebel tier',
      'Exclusive live show access',
      'Artist interview archives',
      'VIP Discord community',
      'Monthly exclusive merch discount',
    ]
  },
  icon: {
    productId: 'prod_SYtbFUCPQe0qoz',
    priceId: 'price_icon_monthly',
    name: 'Icon',
    description: 'This is for the Icon Subscription.',
    price: 5.00,
    type: 'subscription',
    features: [
      'Everything in Legend tier',
      'Personal DJ requests',
      'Exclusive artist meet & greets',
      'Limited edition vinyl access',
      'Co-host opportunities',
    ]
  },
  // Merchandise Products
  tshirt: {
    productId: 'prod_SYtbVypJilHtUK',
    priceId: 'price_tshirt',
    name: 'T-Shirt',
    description: 'This is for the T-shirt merchandise.',
    price: 25.00,
    type: 'merchandise',
    category: 'Clothing',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'White', 'Navy']
  }
};

// Admin API endpoints for radio stations management
app.get('/api/admin/radio-stations', async (req, res) => {
  try {
    const useMockData = req.query.useMockData === 'true';
    
    if (useMockData) {
      // Mock data for testing
      const mockStations = [
        {
          id: 'mock-1',
          name: 'Mock Rock Station',
          url: 'https://example.com/mock-rock',
          genre: 'Rock',
          country: 'USA',
          language: 'English',
          bitrate: 128,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'mock-2',
          name: 'Mock Jazz Station',
          url: 'https://example.com/mock-jazz',
          genre: 'Jazz',
          country: 'USA',
          language: 'English',
          bitrate: 192,
          isActive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      res.json(mockStations);
    } else {
      // Try to fetch from Firebase, fallback to default data
      try {
        const stationsRef = collection(db, 'radioStations');
        const snapshot = await getDocs(stationsRef);
        const stations = [];
        
        snapshot.forEach((doc) => {
          stations.push({ id: doc.id, ...doc.data() });
        });
        
        // If no stations in Firebase, use default
        if (stations.length === 0) {
          stations.push({
            id: 'hot-97',
            name: "Hot 97",
            url: "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFMAAC.aac",
            genre: "Hip Hop & R&B",
            country: "USA",
            language: "English",
            bitrate: 128,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        
        res.json(stations);
      } catch (firebaseError) {
        console.log('Firebase not available, using default data');
        // Fallback to default data
        const stations = [
          {
            id: 'hot-97',
            name: "Hot 97",
            url: "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFMAAC.aac",
            genre: "Hip Hop & R&B",
            country: "USA",
            language: "English",
            bitrate: 128,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        res.json(stations);
      }
    }
  } catch (error) {
    console.error('Error fetching admin radio stations:', error);
    res.status(500).json({ error: 'Failed to fetch radio stations' });
  }
});

// Add/Update Radio Station
app.post('/api/admin/radio-stations', async (req, res) => {
  try {
    const stationData = req.body;
    const useMockData = req.query.useMockData === 'true';
    
    if (useMockData) {
      // Mock response
      res.json({ 
        success: true, 
        station: { id: `station_${Date.now()}`, ...stationData } 
      });
    } else {
      try {
        // Add to Firebase
        const stationsRef = collection(db, 'radioStations');
        const docRef = await addDoc(stationsRef, {
          ...stationData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        res.json({ 
          success: true, 
          station: { id: docRef.id, ...stationData } 
        });
      } catch (firebaseError) {
        console.log('Firebase not available, using mock response');
        res.json({ 
          success: true, 
          station: { id: `station_${Date.now()}`, ...stationData } 
        });
      }
    }
  } catch (error) {
    console.error('Error adding radio station:', error);
    res.status(500).json({ error: 'Failed to add radio station' });
  }
});

// Update Radio Station
app.put('/api/admin/radio-stations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const stationData = req.body;
    const useMockData = req.query.useMockData === 'true';
    
    if (useMockData) {
      // Mock response
      res.json({ 
        success: true, 
        station: { id, ...stationData, updatedAt: new Date().toISOString() } 
      });
    } else {
      try {
        // Update in Firebase
        const stationRef = doc(db, 'radioStations', id);
        await updateDoc(stationRef, {
          ...stationData,
          updatedAt: new Date().toISOString()
        });
        
        res.json({ 
          success: true, 
          station: { id, ...stationData, updatedAt: new Date().toISOString() } 
        });
      } catch (firebaseError) {
        console.log('Firebase not available, using mock response');
        res.json({ 
          success: true, 
          station: { id, ...stationData, updatedAt: new Date().toISOString() } 
        });
      }
    }
  } catch (error) {
    console.error('Error updating radio station:', error);
    res.status(500).json({ error: 'Failed to update radio station' });
  }
});

// Delete Radio Station
app.delete('/api/admin/radio-stations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const useMockData = req.query.useMockData === 'true';
    
    if (useMockData) {
      // Mock response
      res.json({ success: true });
    } else {
      try {
        // Delete from Firebase
        const stationRef = doc(db, 'radioStations', id);
        await deleteDoc(stationRef);
        
        res.json({ success: true });
      } catch (firebaseError) {
        console.log('Firebase not available, using mock response');
        res.json({ success: true });
      }
    }
  } catch (error) {
    console.error('Error deleting radio station:', error);
    res.status(500).json({ error: 'Failed to delete radio station' });
  }
});

// Admin API endpoint for active listeners
app.get('/api/admin/active-listeners', async (req, res) => {
  try {
    const useMockData = req.query.useMockData === 'true';
    
    if (useMockData) {
      // Mock data for testing
      const mockListeners = [
        { id: 'mock-1', name: 'Mock User 1', location: 'New York', listeningTo: 'Mock Rock Station', duration: '2h 15m' },
        { id: 'mock-2', name: 'Mock User 2', location: 'California', listeningTo: 'Mock Jazz Station', duration: '45m' }
      ];
      res.json(mockListeners);
    } else {
      // Real data (mock for now since we don't have real listener tracking)
      const realListeners = [
        { id: 'real-1', name: 'Real User 1', location: 'New York', listeningTo: 'Hot 97', duration: '1h 30m' }
      ];
      res.json(realListeners);
    }
  } catch (error) {
    console.error('Error fetching active listeners:', error);
    res.status(500).json({ error: 'Failed to fetch active listeners' });
  }
});

// Admin API endpoint for user statistics
app.get('/api/admin/user-statistics', async (req, res) => {
  try {
    const useMockData = req.query.useMockData === 'true';
    
    if (useMockData) {
      // Mock data for testing
      const mockStats = [
        { id: 'mock-1', name: 'Mock User 1', email: 'mock1@example.com', joinDate: '2024-01-15', isPremium: true },
        { id: 'mock-2', name: 'Mock User 2', email: 'mock2@example.com', joinDate: '2024-02-20', isPremium: false }
      ];
      res.json(mockStats);
    } else {
      // Real data (mock for now)
      const realStats = [
        { id: 'real-1', name: 'Real User 1', email: 'real1@example.com', joinDate: '2024-03-10', isPremium: true }
      ];
      res.json(realStats);
    }
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Radio stations API endpoint with fallback data
app.get('/api/radio-stations', async (req, res) => {
  try {
    const stations = [
      {
        id: 1,
        name: "Hot 97",
        description: "New York's #1 Hip Hop & R&B",
        streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFMAAC.aac",
        apiUrl: "https://yield-op-idsync.live.streamtheworld.com/idsync.js?stn=WQHTFM",
        apiType: "streamtheworld",
        stationId: "hot-97",
        frequency: "Hot 97",
        location: "New York",
        genre: "Hip Hop",
        website: "https://hot97.com",
        isActive: true,
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: "SomaFM Metal",
        description: "Extreme Metal Music",
        streamUrl: "https://ice1.somafm.com/metal-128-mp3",
        apiUrl: "https://somafm.com/songs/metal.json",
        apiType: "somafm",
        stationId: "somafm-metal",
        frequency: "SomaFM",
        location: "San Francisco",
        genre: "Metal",
        website: "https://somafm.com",
        isActive: true,
        sortOrder: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    res.json(stations);
  } catch (error) {
    console.error('Error fetching radio stations:', error);
    res.status(500).json({ error: 'Failed to fetch radio stations' });
  }
});

// Use fixed path for client/dist in container
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
console.log('📁 Using client/dist path:', clientDistPath);

// Serve static files from client/dist
app.use(express.static(clientDistPath));

// Catch-all route to serve the React app (but not API routes)
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  const indexPath = path.join(clientDistPath, 'index.html');
  console.log('🔄 Serving index.html from:', indexPath);
  res.sendFile(indexPath);
});

// Start the server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check available at: http://localhost:${PORT}/health`);
  console.log(`📱 API status at: http://localhost:${PORT}/api/status`);
  console.log(`🔗 Server address: ${server.address()}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error('❌ Port is already in use');
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  server.close(() => {
    process.exit(1);
  });
});
