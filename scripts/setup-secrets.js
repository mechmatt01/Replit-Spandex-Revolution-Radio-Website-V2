
#!/usr/bin/env node

// Script to help set up required secrets in Replit
// Run this to get a list of secrets that need to be configured

const requiredSecrets = [
  {
    name: 'FIREBASE_API_KEY',
    description: 'Firebase API Key for authentication and database access',
    value: 'AIzaSyCBoEZeDucpm7p9OEDgaUGLzhn5HpItseQ'
  },
  {
    name: 'FIREBASE_AUTH_DOMAIN',
    description: 'Firebase Auth Domain',
    value: 'spandex-salvation-radio-site.firebaseapp.com'
  },
  {
    name: 'FIREBASE_PROJECT_ID',
    description: 'Firebase Project ID',
    value: 'spandex-salvation-radio-site'
  },
  {
    name: 'FIREBASE_STORAGE_BUCKET',
    description: 'Firebase Storage Bucket',
    value: 'spandex-salvation-radio-site.firebasestorage.app'
  },
  {
    name: 'FIREBASE_MESSAGING_SENDER_ID',
    description: 'Firebase Messaging Sender ID',
    value: '632263635377'
  },
  {
    name: 'FIREBASE_APP_ID',
    description: 'Firebase App ID',
    value: '1:632263635377:web:2a9bd6118a6a2cb9d8cd90'
  },
  {
    name: 'GOOGLE_MAPS_API_KEY',
    description: 'Google Maps API Key for map functionality',
    value: 'AIzaSyCBoEZeDucpm7p9OEDgaUGLzhn5HpItseQ'
  },
  {
    name: 'GOOGLE_MAPS_SIGNING_SECRET',
    description: 'Google Maps Signing Secret',
    value: 'xUMvkKZN7YbwACexIGzpV2o5Fms='
  },
  {
    name: 'OPEN_WEATHER_API_KEY',
    description: 'OpenWeather API Key for weather data',
    value: 'bc23ce0746d4fc5c04d1d765589dadc5'
  },
  {
    name: 'GOOGLE_OAUTH_CLIENT_ID',
    description: 'Google OAuth Client ID',
    value: '632263635377-sa02i1luggs8hlmc6ivt0a6i5gv0irrn.apps.googleusercontent.com'
  },
  {
    name: 'GOOGLE_OAUTH_CLIENT_SECRET',
    description: 'Google OAuth Client Secret',
    value: 'z1vTXJmTXOei8lcZIbal5oJoFOk='
  },
  {
    name: 'ENCRYPTION_KEY',
    description: 'Encryption key for securing sensitive data',
    value: 'SpandexSalvationRadio2025SecureKey!'
  }
];

console.log('🔐 REPLIT SECRETS SETUP REQUIRED');
console.log('=====================================\n');

console.log('Please add the following secrets in the Replit Secrets panel:');
console.log('(Tools > Secrets, or use the + button and type "Secrets")\n');

requiredSecrets.forEach((secret, index) => {
  console.log(`${index + 1}. Secret Key: ${secret.name}`);
  console.log(`   Description: ${secret.description}`);
  console.log(`   Value: ${secret.value}`);
  console.log('');
});

console.log('🚨 IMPORTANT SECURITY NOTES:');
console.log('- These secrets are now removed from the codebase');
console.log('- The application will load them from Replit Secrets at runtime');
console.log('- This ensures your API keys are encrypted and secure');
console.log('- Never commit API keys directly to your code again!');
console.log('\n✅ After adding all secrets, restart your application.');
