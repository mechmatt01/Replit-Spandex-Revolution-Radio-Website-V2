import express from "express";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const host = process.env.HOST || "0.0.0.0";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint for Cloud Run
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        port: process.env.PORT || '8080',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Basic API endpoint
app.get('/api/status', (req, res) => {
    res.json({
        message: 'Spandex Salvation Radio API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Serve static files from client/dist if they exist
app.use(express.static('client/dist'));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile('client/dist/index.html', { root: process.cwd() });
});

// Start server
app.listen(port, host, () => {
    console.log(`🚀 Simple server running on ${host}:${port}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 PORT from env: ${process.env.PORT || '8080 (default)'}`);
    console.log(`✅ Health check available at /health`);
});

export default app;
