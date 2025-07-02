#!/usr/bin/env node

import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function buildProduction() {
  console.log('Building frontend...');
  
  // Build frontend first
  const { spawn } = await import('child_process');
  await new Promise((resolve, reject) => {
    const viteProcess = spawn('npx', ['vite', 'build'], { stdio: 'inherit' });
    viteProcess.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Vite build failed with code ${code}`));
    });
  });

  console.log('Building backend...');
  
  // Build backend with bundled dependencies
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outdir: 'dist',
    external: [
      // Only external modules that should not be bundled
      'vite',
      'esbuild'
    ],
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    banner: {
      js: `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
`
    }
  });

  console.log('Fixing vite.config import...');
  
  // Fix the vite.config import issue
  const indexPath = join('dist', 'index.js');
  let content = readFileSync(indexPath, 'utf8');
  
  // Replace the problematic import with a conditional check
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
    },`
  );
  
  writeFileSync(indexPath, content);
  
  console.log('Production build completed successfully!');
  console.log('Run with: NODE_ENV=production node dist/index.js');
}

buildProduction().catch(console.error);