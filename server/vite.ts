import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
// Conditional vite config loading for production compatibility
let viteConfig: any = {};

// Only load vite config in development
if (process.env.NODE_ENV === "development") {
  try {
    const viteConfigModule = await import("../vite.config.js");
    viteConfig = viteConfigModule.default || {};
  } catch (error) {
    console.warn("Could not load vite.config.js:", error.message);
  }
}

// Fallback config for production
if (!viteConfig || Object.keys(viteConfig).length === 0) {
  viteConfig = {
    plugins: [],
    resolve: {
      alias: {
        "@": "./client/src",
        "@shared": "./shared",
        "@assets": "./attached_assets",
      },
    },
    root: "./client",
    publicDir: "./client/public",
    build: {
      outDir: "./client/dist",
      emptyOutDir: true,
    },
  };
}
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Skip Vite setup in production
  if (process.env.NODE_ENV === "production") {
    console.log("Skipping Vite setup in production mode");
    return;
  }

  try {
    const serverOptions = {
      middlewareMode: true,
      hmr: { server },
      allowedHosts: true,
    };

    const vite = await createViteServer({
      ...viteConfig,
      configFile: false,
      customLogger: {
        ...viteLogger,
        error: (msg, options) => {
          viteLogger.error(msg, options);
          if (process.env.NODE_ENV !== "production") {
            process.exit(1);
          }
        },
      },
      server: serverOptions,
      appType: "custom",
    });

  app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } catch (error) {
    console.error("Error setting up Vite:", error);
    if (process.env.NODE_ENV === "production") {
      console.log("Continuing without Vite in production");
      return;
    }
    throw error;
  }
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "client/dist");
  console.log("Serving static files from:", distPath);

  if (!fs.existsSync(distPath)) {
    console.error(`Static files directory not found: ${distPath}`);
    console.error("Please run 'npm run build' first");
    return;
  }

  app.use(express.static(distPath));

  // Catch-all handler for SPA routing
  app.get("*", (req, res) => {
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Application not built. Please run 'npm run build'");
    }
  });
}