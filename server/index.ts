import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
// Force refresh for weather API

// Load environment variables
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

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

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve the app on port 3500 for manual runs, port 5000 for Replit workflow
  // this serves both the API and the client.
  const port = parseInt(process.env.PORT || "3500");
  const host = process.env.HOST || "0.0.0.0";

  // Enhanced port cleanup for manual runs
  const startServer = () => {
    server.listen(
      {
        port,
        host,
        reusePort: true,
      },
      () => {
        log(`serving on ${host}:${port}`);
      },
    );
  };

  // Check if port is in use and handle gracefully
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, attempting to kill existing processes...`);
      const { exec } = require('child_process');
      exec(`lsof -ti:${port} | xargs kill -9 2>/dev/null`, (error) => {
        if (error) {
          console.log(`Could not kill processes on port ${port}. Please stop the Replit workflow or use a different port.`);
          process.exit(1);
        } else {
          console.log(`Cleaned up port ${port}, retrying...`);
          setTimeout(startServer, 1000); // Wait a second before retrying
        }
      });
    } else {
      throw err;
    }
  });

  startServer();
})();
