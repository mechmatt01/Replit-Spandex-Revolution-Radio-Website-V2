#!/usr/bin/env node

import { build } from "esbuild";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

async function buildProduction() {
  console.log("Building frontend...");

  // Build frontend first
  const { spawn } = await import("child_process");
  await new Promise((resolve, reject) => {
    const viteProcess = spawn("npx", ["vite", "build"], { stdio: "inherit" });
    viteProcess.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Vite build failed with code ${code}`));
    });
  });

  console.log("Building backend...");

  // Build backend with bundled dependencies
  await build({
    entryPoints: ["server/index.ts"],
    bundle: true,
    platform: "node",
    target: "node18",
    format: "esm",
    outdir: "dist",
    external: [
      // Only external modules that should not be bundled
      "vite",
      "esbuild",
    ],
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    banner: {
      js: `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
`,
    },
  });

  console.log("Fixing vite.config import...");

  // Fix the vite.config import issue
  const indexPath = join("dist", "index.js");
  let content = readFileSync(indexPath, "utf8");

  // Replace the problematic vite.config import with conditional loading
  content = content.replace(
    /import viteConfig from "\.\.\/vite\.config";/g,
    `// Conditionally load vite config for production
let viteConfig = {};
if (process.env.NODE_ENV === "development") {
  try {
    const viteConfigModule = await import("../vite.config.js");
    viteConfig = viteConfigModule.default;
  } catch (error) {
    console.warn("Could not load vite.config.js:", error);
  }
}
// Fallback inline config for production
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
}`,
  );

  // Replace any other problematic vite.config spread operators
  content = content.replace(
    /\.\.\.\(await import\("\.\.\/vite\.config(?:\.js)?"\)\)\.default,/g,
    `// Inline vite config for production
    {
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
    },`,
  );

  // Add error handling for setupVite function
  content = content.replace(
    /export async function setupVite\(app, server\) {/g,
    `export async function setupVite(app, server) {
  try {
    // Skip Vite setup in production
    if (process.env.NODE_ENV === "production") {
      console.log("Skipping Vite setup in production");
      return;
    }`,
  );

  // Close the try block for setupVite
  content = content.replace(
    /app\.use\(vite\.middlewares\);/g,
    `app.use(vite.middlewares);
  } catch (error) {
    console.error("Error setting up Vite:", error);
    if (process.env.NODE_ENV === "production") {
      console.log("Continuing without Vite in production mode");
      return;
    }
    throw error;
  }`,
  );

  // Fix the serveStatic function to use the correct path
  content = content.replace(
    /const distPath = path\.resolve\(import\.meta\.dirname, "public"\);/g,
    `const distPath = path.resolve(process.cwd(), "client/dist");`,
  );

  // Ensure the server listens on the correct host and port for deployment
  content = content.replace(
    /server\.listen\(\{[^}]*\}/g,
    `server.listen({
    port: process.env.PORT || process.env.REPL_LISTEN_PORT || 5000,
    host: process.env.HOST || process.env.REPL_LISTEN_IP || "0.0.0.0"
  }`,
  );

  writeFileSync(indexPath, content);

  console.log("Production build completed successfully!");
  console.log("Run with: NODE_ENV=production node dist/index.js");
}

buildProduction().catch(console.error);
