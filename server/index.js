import express from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, log } from "./vite.js";
import { db } from "./firebaseStorage.js";
// Force refresh for weather API
// Load environment variables
import * as dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint for Cloud Run
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        port: process.env.PORT || '4000',
        environment: process.env.NODE_ENV || 'development'
    });
});

app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }
            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }
            log(logLine);
        }
    });
    next();
});
// Initialize default radio stations
const initializeDefaultStations = async () => {
    try {
        console.log('Initializing default radio stations...');
        // Check if billing is enabled by trying a simple query first
        try {
            const testQuery = await db.collection('RadioStations').limit(1).get();
            console.log('Firebase connection successful');
        }
        catch (billingError) {
            if (billingError.code === 7 && billingError.message?.includes('billing')) {
                console.warn('⚠️  Firebase billing not enabled. Some features may be limited.');
                console.warn('To enable full functionality, visit: https://console.developers.google.com/billing/enable?project=spandex-salvation-radio-site');
                return; // Exit early but don't crash the server
            }
            throw billingError;
        }
        const defaultStations = [
            {
                name: "95.5 The Beat",
                streamUrl: "https://stream.radio.co/s2b8c8b8c8/listen",
                genre: "Hip Hop",
                location: "Los Angeles, CA",
                isActive: true
            },
            {
                name: "Hot 97",
                streamUrl: "https://stream.radio.co/s2b8c8b8c8/listen",
                genre: "Hip Hop",
                location: "New York, NY",
                isActive: true
            },
            {
                name: "Power 106",
                streamUrl: "https://stream.radio.co/s2b8c8b8c8/listen",
                genre: "Hip Hop",
                location: "Los Angeles, CA",
                isActive: true
            },
            {
                name: "SomaFM Metal",
                streamUrl: "https://ice1.somafm.com/metal-128-mp3",
                genre: "Metal",
                location: "San Francisco, CA",
                isActive: true
            }
        ];
        for (const station of defaultStations) {
            try {
                await db.collection('RadioStations').add(station);
                console.log(`✅ Created station: ${station.name}`);
            }
            catch (error) {
                if (error.code === 7 && error.message?.includes('billing')) {
                    console.warn(`⚠️  Skipping station creation due to billing: ${station.name}`);
                }
                else {
                    console.error(`❌ Error creating station ${station.name}:`, error.message);
                }
            }
        }
    }
    catch (error) {
        console.error('❌ Error initializing default stations:', error);
    }
};
(async () => {
    const server = await registerRoutes(app);
    app.use((err, _req, res, _next) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
        throw err;
    });
    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("SKIP_CLIENT:", process.env.SKIP_CLIENT);
    if (process.env.SKIP_CLIENT === "true") {
        console.log("Skipping Vite setup - running in separate client/server mode");
    }
    else {
        console.log("Setting up Vite...");
        await setupVite(app, server);
    }
    // Serve the app on the port specified by Cloud Run (PORT=8080) or fallback to 4000 for local dev
    const port = parseInt(process.env.PORT || "4000");
    const host = process.env.HOST || "0.0.0.0";
    
    // Ensure we're binding to the correct port for Cloud Run
    console.log(`🚀 Server starting on port ${port} (Cloud Run expects PORT=8080)`);
    
    server.listen({
        port,
        host,
        reusePort: true,
    }, () => {
        log(`✅ Server running on ${host}:${port}`);
        log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
        log(`🔧 PORT from env: ${process.env.PORT || '4000 (default)'}`);
    });
})();
