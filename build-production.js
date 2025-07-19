#!/usr/bin/env node

// Production build script for Spandex Salvation Radio
import { build } from 'esbuild';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting production build...');

// Step 1: Build the client (frontend)
console.log('📦 Building frontend...');
try {
  execSync('cd client && npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend build completed');
} catch (error) {
  console.error('❌ Frontend build failed:', error.message);
  process.exit(1);
}

// Step 2: Build the backend
console.log('🔧 Building backend...');
try {
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    outfile: 'dist/index.js',
    platform: 'node',
    target: 'node20',
    format: 'esm',
    external: [
      // Don't bundle node modules
      'express',
      'pg',
      'drizzle-orm',
      'firebase-admin',
      'nodemailer',
      'passport',
      'bcryptjs',
      'jsonwebtoken',
      'stripe',
      'openai',
      'multer',
      'cors',
      'helmet',
      'express-session',
      'connect-pg-simple',
      'ws'
    ],
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    loader: {
      '.ts': 'ts',
      '.tsx': 'tsx'
    },
    resolveExtensions: ['.ts', '.tsx', '.js', '.jsx'],
    tsconfig: 'tsconfig.json',
    sourcemap: false,
    minify: true,
    keepNames: true,
    metafile: true
  });
  console.log('✅ Backend build completed');
} catch (error) {
  console.error('❌ Backend build failed:', error.message);
  process.exit(1);
}

// Step 3: Create production package.json for runtime dependencies
console.log('📄 Creating production package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const productionPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  type: 'module',
  main: 'index.js',
  scripts: {
    start: 'node index.js'
  },
  dependencies: {
    // Only include runtime dependencies
    'express': packageJson.dependencies.express,
    'pg': packageJson.dependencies.pg || '^8.7.1',
    'drizzle-orm': packageJson.dependencies['drizzle-orm'],
    'firebase-admin': packageJson.dependencies['firebase-admin'],
    'nodemailer': packageJson.dependencies.nodemailer,
    'passport': packageJson.dependencies.passport,
    'passport-local': packageJson.dependencies['passport-local'],
    'passport-google-oauth20': packageJson.dependencies['passport-google-oauth20'],
    'bcryptjs': packageJson.dependencies.bcryptjs,
    'jsonwebtoken': packageJson.dependencies.jsonwebtoken,
    'stripe': packageJson.dependencies.stripe,
    'openai': packageJson.dependencies.openai,
    'multer': packageJson.dependencies.multer,
    'cors': packageJson.dependencies.cors,
    'helmet': packageJson.dependencies.helmet,
    'express-session': packageJson.dependencies['express-session'],
    'connect-pg-simple': packageJson.dependencies['connect-pg-simple'],
    'ws': packageJson.dependencies.ws,
    'dotenv': packageJson.dependencies.dotenv,
    'uuid': packageJson.dependencies.uuid,
    'zod': packageJson.dependencies.zod,
    'date-fns': packageJson.dependencies['date-fns'],
    'xml2js': packageJson.dependencies['xml2js']
  },
  engines: packageJson.engines
};

fs.writeFileSync('dist/package.json', JSON.stringify(productionPackageJson, null, 2));

// Step 4: Copy client build to dist for serving
console.log('📁 Copying client build...');
const clientDistPath = path.join('client', 'dist');
const distClientPath = path.join('dist', 'public');

if (fs.existsSync(distClientPath)) {
  fs.rmSync(distClientPath, { recursive: true, force: true });
}

fs.cpSync(clientDistPath, distClientPath, { recursive: true });

console.log('✅ Production build completed successfully!');
console.log('📂 Build output:');
console.log('   - Backend: dist/index.js');
console.log('   - Frontend: dist/public/');
console.log('   - Runtime deps: dist/package.json');
console.log('');
console.log('🚀 To start production server:');
console.log('   cd dist && npm install --production && node index.js');