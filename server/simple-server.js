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

// Use fixed path for client/dist in container
const clientDistPath = path.join(__dirname, 'client', 'dist');
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
