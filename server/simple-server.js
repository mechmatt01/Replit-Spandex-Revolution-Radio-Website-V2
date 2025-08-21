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
      
      // Generate appropriate metadata for real radio stations
      const nowPlayingData = {
        id: Date.now(),
        title: "Live Radio",
        artist: "Hot 97",
        album: "97.1 FM New York",
        isLive: true,
        timestamp: new Date().toISOString(),
        artwork: "real-radio",
        stationId,
        stationName: "Hot 97",
        frequency: "97.1 FM",
        location: "New York, NY",
        genre: "Hip Hop & R&B",
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
