import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Add better error handling and logging
console.log('🚀 Starting Spandex Salvation Radio Server...');
console.log('📍 Current directory:', __dirname);
console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
console.log('🌐 Port:', PORT);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'Spandex Salvation Radio API is running',
    timestamp: new Date().toISOString()
  });
});

// Try multiple possible paths for client/dist
const possiblePaths = [
  path.join(__dirname, 'client/dist'),
  path.join(__dirname, '../client/dist'),
  path.join(process.cwd(), 'client/dist'),
  '/app/client/dist'
];

let clientDistPath = null;
for (const testPath of possiblePaths) {
  try {
    if (fs.existsSync(testPath)) {
      clientDistPath = testPath;
      console.log('✅ Found client/dist at:', clientDistPath);
      break;
    }
  } catch (error) {
    console.log('⚠️  Could not check path:', testPath);
  }
}

if (!clientDistPath) {
  console.error('❌ Could not find client/dist directory!');
  console.error('📍 Searched paths:', possiblePaths);
  process.exit(1);
}

// Serve static files from client/dist
app.use(express.static(clientDistPath));
console.log('📁 Serving static files from:', clientDistPath);

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  console.log('🔄 Serving index.html from:', indexPath);
  res.sendFile(indexPath);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check available at: http://localhost:${PORT}/health`);
  console.log(`📱 API status at: http://localhost:${PORT}/api/status`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
