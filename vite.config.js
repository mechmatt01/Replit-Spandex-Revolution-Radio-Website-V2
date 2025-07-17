import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "client/src"),
      "@shared": path.resolve(process.cwd(), "shared"),
      "@assets": path.resolve(process.cwd(), "attached_assets"),
    },
  },
  root: path.resolve(process.cwd(), "client"),
  publicDir: path.resolve(process.cwd(), "client/public"),
  build: {
    outDir: path.resolve(process.cwd(), "client/dist"),
    emptyOutDir: true,
  },
  css: {
    postcss: "./client/postcss.config.js",
  },
});
