// Test Firebase credentials
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

console.log('Testing Firebase credentials...');

// Check environment variables
console.log('Project ID:', process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Missing');
console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Missing');
console.log('Private Key length:', process.env.FIREBASE_PRIVATE_KEY?.length || 0);
console.log('Private Key starts with:', process.env.FIREBASE_PRIVATE_KEY?.substring(0, 27) || 'Missing');

// Process private key
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
console.log('Processed Private Key starts with:', privateKey?.substring(0, 27) || 'Missing');
console.log('Processed Private Key ends with:', privateKey?.substring(privateKey.length - 27) || 'Missing');

try {
  const app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: privateKey,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
  
  console.log('Firebase app initialized successfully!');
  
  const db = getFirestore(app);
  console.log('Firestore instance created successfully!');
  
  // Test a simple read operation
  db.collection('test').limit(1).get()
    .then(() => console.log('Firestore read test successful!'))
    .catch(err => console.error('Firestore read test failed:', err.message));
    
} catch (error) {
  console.error('Firebase initialization failed:', error.message);
}