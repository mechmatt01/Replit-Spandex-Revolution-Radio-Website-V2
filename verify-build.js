
#!/usr/bin/env node

import { readFileSync, existsSync } from "fs";
import { resolve, join } from "path";

console.log("🔍 Verifying build configuration...");

// Check if all asset files exist
const assetsDir = "attached_assets";
const requiredAssets = [
  "CountriesIcon.png",
  "GoogleLogoIcon.png", 
  "IconPackageIcon.png",
  "LegendPackageIcon.png",
  "LiveNowIcon.png",
  "MusicLogoIcon@3x.png",
  "RebelPackageIcon.png"
];

console.log("📁 Checking asset files...");
let missingAssets = [];
requiredAssets.forEach(asset => {
  const assetPath = join(assetsDir, asset);
  if (!existsSync(assetPath)) {
    missingAssets.push(asset);
    console.log(`❌ Missing: ${asset}`);
  } else {
    console.log(`✅ Found: ${asset}`);
  }
});

// Check for problematic asset imports
console.log("\n📋 Checking asset imports...");
const sourceFiles = [
  "client/src/components/AuthModal.tsx",
  "client/src/components/StripePaymentProcessor.tsx", 
  "client/src/components/FullWidthGlobeMap.tsx",
  "client/src/components/RadioCoPlayer.tsx",
  "client/src/components/ThemedMusicLogo.tsx"
];

let importIssues = [];
sourceFiles.forEach(file => {
  if (existsSync(file)) {
    const content = readFileSync(file, "utf8");
    
    // Check for old asset imports with timestamps
    const problematicImports = content.match(/@assets\/[^"']*_\d+\.(png|jpg|jpeg|gif|svg)/g);
    if (problematicImports) {
      importIssues.push({ file, imports: problematicImports });
      console.log(`❌ ${file}: Found problematic imports`);
      problematicImports.forEach(imp => console.log(`   ${imp}`));
    } else {
      console.log(`✅ ${file}: Asset imports look good`);
    }
  }
});

// Check Vite configuration
console.log("\n⚙️  Checking Vite configuration...");
if (existsSync("client/vite.config.ts")) {
  const viteConfig = readFileSync("client/vite.config.ts", "utf8");
  if (viteConfig.includes('@assets')) {
    console.log("✅ Vite asset alias configured");
  } else {
    console.log("❌ Vite asset alias not found");
  }
} else {
  console.log("❌ Vite config file not found");
}

// Check Tailwind configuration
console.log("\n🎨 Checking Tailwind configuration...");
if (existsSync("client/tailwind.config.js")) {
  const tailwindConfig = readFileSync("client/tailwind.config.js", "utf8");
  if (tailwindConfig.includes('./src/**/*.{js,ts,jsx,tsx}')) {
    console.log("✅ Tailwind content paths configured");
  } else {
    console.log("❌ Tailwind content paths not properly configured");
  }
} else {
  console.log("❌ Tailwind config file not found");
}

// Summary
console.log("\n📊 Summary:");
if (missingAssets.length === 0 && importIssues.length === 0) {
  console.log("🎉 All checks passed! Build should deploy successfully.");
} else {
  console.log("⚠️  Issues found that need to be resolved:");
  if (missingAssets.length > 0) {
    console.log(`   - ${missingAssets.length} missing asset files`);
  }
  if (importIssues.length > 0) {
    console.log(`   - ${importIssues.length} files with problematic imports`);
  }
}
