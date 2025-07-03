// Production configuration to avoid vite.config import issues
export default {
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
