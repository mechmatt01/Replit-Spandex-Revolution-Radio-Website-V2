import { createServer, createLogger } from "vite";
import type { Express } from "express";
import type { Server } from "http";
import express from "express";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";

const __filename = require.main?.filename || "";
const __dirname = path.dirname(__filename);

const viteLogger = createLogger();

const viteConfig = {
  root: path.resolve(__dirname, "..", "client"),
  build: {
    outDir: path.resolve(__dirname, "..", "client", "dist"),
  },
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "..", "client", "src"),
      "@shared": path.resolve(__dirname, "..", "shared"),
      "@assets": path.resolve(__dirname, "..", "attached_assets"),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json']
  },
};

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

    const vite = await createServer({
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
      server: {
        ...serverOptions,
        allowedHosts: true
      },
      appType: "custom",
    });

    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;

      try {
        const clientTemplate = path.resolve(
          __dirname,
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
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
