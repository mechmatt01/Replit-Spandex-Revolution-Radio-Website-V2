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
        const metadata = {
          title: track.title || 'Unknown Track',
          artist: track.artist || 'Unknown Artist',
          album: track.album,
          artwork: track.image,
          stationName: `SomaFM ${channel.charAt(0).toUpperCase() + channel.slice(1)}`,
          timestamp: Date.now(),
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

// Now Playing API with real metadata fetcher
app.get('/api/now-playing', async (req, res) => {
  try {
    const stationId = req.query.station || "metal"; // Default to SomaFM Metal

    console.log(`Fetching now playing for station: ${stationId}`);

    // Map station IDs to SomaFM channels
    const stationMap = {
      'somafm-metal': 'metal',
      'metal': 'metal',
      'somafm-groovesalad': 'groovesalad',
      'groovesalad': 'groovesalad',
      'hot-97': 'metal', // Fallback to metal for now
      'hot-105': 'metal', // Fallback to metal for now
      'q-93': 'metal', // Fallback to metal for now
      'beat-955': 'metal' // Fallback to metal for now
    };

    const channel = stationMap[stationId] || 'metal';
    const metadata = await fetchSomaFMMetadata(channel);

    if (!metadata) {
      console.log(`No metadata found for station: ${stationId}`);
      return res.status(404).json({ error: 'No metadata available for this station' });
    }

    // Create the response with real metadata
    const nowPlayingData = {
      id: Date.now(), // Use timestamp as ID
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
      isAd: false,
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

// Catch-all route to serve the React app
app.get('*', (req, res) => {
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
