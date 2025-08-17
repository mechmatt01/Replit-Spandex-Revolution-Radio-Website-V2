import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Add better error handling and logging
console.log('🚀 Starting Spandex Salvation Radio Server...');
console.log('📍 Current directory:', __dirname);
console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
console.log('🌐 Port:', PORT);
console.log('📁 Process cwd:', process.cwd());
console.log('📦 Node version:', process.version);

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.status(200).json({ 
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
    message: 'Spandex Salvation Radio API is running',
    timestamp: new Date().toISOString()
  });
});

// Radio stream proxy endpoint
app.get('/api/radio-stream', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    // Validate URL format
    try {
      const urlObj = new URL(url);
      if (!urlObj.protocol.startsWith('http')) {
        return res.status(400).json({ error: 'Invalid URL protocol. Only HTTP/HTTPS URLs are allowed.' });
      }
    } catch (urlError) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    // For local development, proxy the actual radio stream
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Set appropriate headers for audio streaming
      res.setHeader('Content-Type', 'audio/aac');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      // Pipe the audio stream to the response
      response.body.pipe(res);
    } catch (proxyError) {
      console.error('Stream proxy error:', proxyError);
      // Fallback to mock response for development
      res.json({ 
        success: false, 
        message: 'Stream proxy failed, using mock data',
        error: proxyError.message,
        url: url 
      });
    }
  } catch (error) {
    console.error('Radio stream error:', error);
    res.status(500).json({ error: 'Failed to load radio stream' });
  }
});

// Weather API endpoint
app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    // For local development, return mock weather data
    // In production, this would call the actual weather API
    const mockWeather = {
      location: "New York, NY",
      temperature: 72,
      description: "Partly Cloudy",
      icon: "02d",
      humidity: 65,
      windSpeed: 8,
      feelsLike: 74
    };
    
    res.json(mockWeather);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Stream stats endpoint
app.get('/api/stream-stats', (req, res) => {
  // Mock stream stats for local development
  const mockStats = {
    currentListeners: 1250,
    totalStreams: 15420,
    peakListeners: 3200,
    uptime: "99.9%"
  };
  
  res.json(mockStats);
});

// Now Playing API with enhanced metadata and artwork
app.get('/api/now-playing', async (req, res) => {
  try {
    const stationId = req.query.station || "somafm-metal"; // Default to SomaFM Metal

    console.log(`Fetching now playing for station: ${stationId}`);

    // Mock metadata for development
    const mockMetadata = {
      title: "Breaking the Law",
      artist: "Judas Priest",
      album: "British Steel",
      artwork: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      stationName: "SomaFM Metal",
      frequency: "Online",
      location: "San Francisco, CA",
      genre: "Heavy Metal & Hard Rock"
    };

    const nowPlayingData = {
      id: 1,
      title: mockMetadata.title,
      artist: mockMetadata.artist,
      album: mockMetadata.album,
      isLive: true,
      timestamp: new Date().toISOString(),
      artwork: mockMetadata.artwork,
      stationId,
      stationName: mockMetadata.stationName,
      frequency: mockMetadata.frequency,
      location: mockMetadata.location,
      genre: mockMetadata.genre,
      isAd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log(`Now playing: "${mockMetadata.title}" by ${mockMetadata.artist} on ${mockMetadata.stationName}`);
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

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => {
    process.exit(1);
  });
});
