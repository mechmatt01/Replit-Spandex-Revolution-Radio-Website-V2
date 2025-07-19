import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
// Conditional vite config loading for production compatibility
let viteConfig = {};
// Only load vite config in development
if (process.env.NODE_ENV === "development") {
    try {
        const viteConfigModule = await import("../vite.config.js");
        viteConfig = viteConfigModule.default || {};
    }
    catch (error) {
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
export function log(message, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    console.log(`${formattedTime} [${source}] ${message}`);
}
export async function setupVite(app, server) {
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
                const clientTemplate = path.resolve(import.meta.dirname, "..", "client", "index.html");
                // always reload the index.html file from disk incase it changes
                let template = await fs.promises.readFile(clientTemplate, "utf-8");
                template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
                const page = await vite.transformIndexHtml(url, template);
                res.status(200).set({ "Content-Type": "text/html" }).end(page);
            }
            catch (e) {
                vite.ssrFixStacktrace(e);
                next(e);
            }
        });
    }
    catch (error) {
        console.error("Error setting up Vite:", error);
        if (process.env.NODE_ENV === "production") {
            console.log("Continuing without Vite in production");
            return;
        }
        throw error;
    }
}
export function serveStatic(app) {
    const distPath = path.resolve(process.cwd(), "client/dist");
    console.log("Serving static files from:", distPath);
    if (!fs.existsSync(distPath)) {
        throw new Error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
    }
    app.use(express.static(distPath));
    // fall through to index.html if the file doesn't exist
    app.use("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
    });
}
