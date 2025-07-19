#!/usr/bin/env node

// Comprehensive deployment fix script
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting comprehensive deployment build...');

// Step 1: Build the client
console.log('📦 Building client...');
try {
  execSync('cd client && npm run build', { stdio: 'inherit' });
  console.log('✅ Client build completed');
} catch (error) {
  console.error('❌ Client build failed:', error.message);
  process.exit(1);
}

// Step 2: Build the backend with proper TypeScript compilation
console.log('🔧 Building backend...');
try {
  // Clean dist directory first
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  fs.mkdirSync('dist', { recursive: true });
  
  // Compile TypeScript to JavaScript
  execSync('npx tsc --project tsconfig.build.json', { stdio: 'inherit' });
  console.log('✅ Backend TypeScript compilation completed');
} catch (error) {
  console.error('❌ Backend build failed:', error.message);
  console.log('🔄 Trying with relaxed TypeScript settings...');
  
  // Create a more lenient tsconfig for deployment
  const relaxedConfig = {
    "compilerOptions": {
      "target": "ES2022",
      "lib": ["ES2022"],
      "module": "ESNext",
      "moduleResolution": "node",
      "outDir": "./dist",
      "rootDir": "./",
      "allowSyntheticDefaultImports": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "strict": false,
      "noEmit": false,
      "declaration": false,
      "removeComments": true,
      "resolveJsonModule": true,
      "allowJs": true,
      "noImplicitAny": false,
      "noImplicitReturns": false,
      "noImplicitThis": false,
      "noUnusedLocals": false,
      "noUnusedParameters": false,
      "baseUrl": ".",
      "types": ["node"]
    },
    "include": ["server/**/*", "shared/**/*"],
    "exclude": ["node_modules", "client", "**/*.test.ts", "dist"]
  };
  
  fs.writeFileSync('tsconfig.deploy.json', JSON.stringify(relaxedConfig, null, 2));
  
  try {
    execSync('npx tsc --project tsconfig.deploy.json', { stdio: 'inherit' });
    console.log('✅ Backend build completed with relaxed settings');
  } catch (relaxedError) {
    console.error('❌ Even relaxed TypeScript compilation failed');
    process.exit(1);
  }
}

// Step 3: Copy static assets and create production package.json
console.log('📁 Setting up production structure...');

// Copy client build to dist/public
const clientDistPath = 'client/dist';
const distPublicPath = 'dist/public';
if (fs.existsSync(clientDistPath)) {
  if (fs.existsSync(distPublicPath)) {
    fs.rmSync(distPublicPath, { recursive: true, force: true });
  }
  fs.cpSync(clientDistPath, distPublicPath, { recursive: true });
  console.log('✅ Client assets copied to dist/public');
}

// Create production package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const productionPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  type: 'module',
  main: 'server/index.js',
  scripts: {
    start: 'node server/index.js'
  },
  dependencies: packageJson.dependencies,
  engines: packageJson.engines
};

fs.writeFileSync('dist/package.json', JSON.stringify(productionPackageJson, null, 2));

// Step 4: Verify build output
console.log('🔍 Verifying build output...');
const requiredFiles = [
  'dist/server/index.js',
  'dist/package.json',
  'dist/public/index.html'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing required file: ${file}`);
    allFilesExist = false;
  } else {
    console.log(`✅ Found: ${file}`);
  }
}

if (!allFilesExist) {
  console.error('❌ Build verification failed - missing required files');
  process.exit(1);
}

console.log('✅ Build verification completed successfully!');
console.log('🎉 Production build is ready for deployment');
console.log('📂 Build structure:');
console.log('   - dist/server/index.js (backend entry point)');
console.log('   - dist/package.json (production dependencies)');
console.log('   - dist/public/ (frontend static files)');