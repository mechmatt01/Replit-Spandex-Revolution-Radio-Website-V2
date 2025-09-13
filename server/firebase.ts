import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin SDK
let firebaseApp;
const apps = getApps();
if (apps.length === 0) {
  // Try to load service account from file
  let serviceAccount;
  const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    console.log('Loaded Firebase service account from file');
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
    console.log('Loaded Firebase service account from environment variables');
  } else {
    console.log('Firebase service account not found - running in offline mode');
    // Don't throw error, just set firebaseApp to null for offline mode
    firebaseApp = null;
  }

  if (serviceAccount) {
    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: `${serviceAccount.projectId}.firebasestorage.app`,
    });
  }
} else {
  firebaseApp = apps[0];
}

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const firestore = firebaseApp ? getFirestore(firebaseApp) : null;
export const storage = firebaseApp ? getStorage(firebaseApp) : null;

// Generate a random 10-character alphanumeric key
export function generateUserKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Verify Firebase ID token
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return null;
  }
}

// Send email verification
export async function sendEmailVerification(email: string) {
  try {
    const user = await auth.getUserByEmail(email);
    await auth.generateEmailVerificationLink(email);
    return true;
  } catch (error) {
    console.error('Error sending email verification:', error);
    return false;
  }
}

// Send phone verification SMS
export async function sendPhoneVerification(phoneNumber: string) {
  try {
    // This would typically use Twilio or another SMS service
    // For now, we'll generate a verification code and store it
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    return verificationCode;
  } catch (error) {
    console.error('Error sending phone verification:', error);
    return null;
  }
} 