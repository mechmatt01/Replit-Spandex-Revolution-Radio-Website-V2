
#!/usr/bin/env node

// Validate that all required secrets are properly configured
const requiredSecrets = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN', 
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
  'GOOGLE_MAPS_API_KEY',
  'OPEN_WEATHER_API_KEY'
];

const optionalSecrets = [
  'GOOGLE_MAPS_SIGNING_SECRET',
  'GOOGLE_OAUTH_CLIENT_ID',
  'GOOGLE_OAUTH_CLIENT_SECRET',
  'ENCRYPTION_KEY'
];

console.log('🔍 VALIDATING REPLIT SECRETS CONFIGURATION');
console.log('==========================================\n');

let missingRequired = [];
let missingOptional = [];

// Check required secrets
requiredSecrets.forEach(secret => {
  if (!process.env[secret]) {
    missingRequired.push(secret);
  } else {
    console.log(`✅ ${secret}: Configured`);
  }
});

// Check optional secrets
optionalSecrets.forEach(secret => {
  if (!process.env[secret]) {
    missingOptional.push(secret);
  } else {
    console.log(`✅ ${secret}: Configured`);
  }
});

if (missingRequired.length > 0) {
  console.log('\n❌ MISSING REQUIRED SECRETS:');
  missingRequired.forEach(secret => {
    console.log(`   - ${secret}`);
  });
  console.log('\n🚨 Please add these secrets in Replit Secrets panel!');
  console.log('   Tools > Secrets (or use + button and type "Secrets")');
  process.exit(1);
}

if (missingOptional.length > 0) {
  console.log('\n⚠️ MISSING OPTIONAL SECRETS:');
  missingOptional.forEach(secret => {
    console.log(`   - ${secret}`);
  });
  console.log('\n📝 These are optional but recommended for full functionality.');
}

console.log('\n✅ ALL REQUIRED SECRETS ARE CONFIGURED!');
console.log('🔐 Your API keys are secure and loaded from Replit Secrets.');
