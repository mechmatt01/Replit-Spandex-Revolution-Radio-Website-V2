import admin from "firebase-admin";
import { readFileSync } from "fs";
import { join } from "path";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Try to read service account from file
    const serviceAccountPath = join(process.cwd(), 'firebase-service-account.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    // Fallback to application default credentials
    admin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    });
  }
}

export const auth = admin.auth();
export const db = admin.firestore();
export default admin;