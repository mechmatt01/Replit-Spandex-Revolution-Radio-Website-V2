import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

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
    
    // For local development, just return a success response
    // In production, this would proxy the actual radio stream
    res.json({ 
      success: true, 
      message: 'Radio stream endpoint working',
      url: url 
    });
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
