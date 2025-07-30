import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import bcrypt from 'bcryptjs';

// Initialize Firebase Admin (if not already initialized)
if (!getApps().length) {
  try {
    const serviceAccount = require('../firebase-service-account.json');
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: 'spandex-salvation-radio-site.firebasestorage.app'
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
  }
}

export const db = getFirestore();

// Available avatars in Firebase Storage
const AVATAR_OPTIONS = [
  'gs://spandex-salvation-radio-site.firebasestorage.app/Avatars/Bass-Bat.png',
  'gs://spandex-salvation-radio-site.firebasestorage.app/Avatars/Drum-Dragon.png',
  'gs://spandex-salvation-radio-site.firebasestorage.app/Avatars/Headbanger-Hamster.png',
  'gs://spandex-salvation-radio-site.firebasestorage.app/Avatars/Metal-Queen.png',
  'gs://spandex-salvation-radio-site.firebasestorage.app/Avatars/Metal Cat.png',
  'gs://spandex-salvation-radio-site.firebasestorage.app/Avatars/Mosh-Pit-Monster.png',
  'gs://spandex-salvation-radio-site.firebasestorage.app/Avatars/Rebel-Raccoon.png',
  'gs://spandex-salvation-radio-site.firebasestorage.app/Avatars/Rock-Unicorn.png'
];

// Generate random 10-character alphanumeric string
export function generateUserKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Get random avatar URL
export function getRandomAvatar(): string {
  return AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export interface UserProfileData {
  FirstName: string;
  LastName: string;
  UserProfileImage: string;
  EmailAddress: string;
  PhoneNumber: string;
  Location?: { lat: number; lng: number; address?: string };
  IsActiveListening: boolean;
  ActiveSubscription: boolean;
  RenewalDate?: Date;
  UserID: string;
  PasswordHash?: string; // Only for non-Google users
  GoogleID?: string; // Only for Google users
  CreatedAt: Date;
  LastLoginAt?: Date;
}

// Create new user account in Firestore
export async function createFirestoreUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  googleId?: string;
}): Promise<{ userKey: string; userData: UserProfileData }> {
  const userKey = generateUserKey();
  const profileImageUrl = getRandomAvatar();
  
  const userProfileData: UserProfileData = {
    FirstName: userData.firstName,
    LastName: userData.lastName,
    UserProfileImage: profileImageUrl,
    EmailAddress: userData.email,
    PhoneNumber: userData.phoneNumber || '',
    Location: undefined,
    IsActiveListening: false,
    ActiveSubscription: false,
    RenewalDate: undefined,
    UserID: userKey,
    CreatedAt: new Date(),
    LastLoginAt: new Date()
  };

  // Add password hash for non-Google users
  if (userData.password) {
    userProfileData.PasswordHash = await hashPassword(userData.password);
  }

  // Add Google ID for Google users
  if (userData.googleId) {
    userProfileData.GoogleID = userData.googleId;
  }

  // Save to Firestore under Users > User:{userKey}
  await db.collection('Users').doc(`User:${userKey}`).set(userProfileData);
  
  return { userKey, userData: userProfileData };
}

// Authenticate user (email/password login)
export async function authenticateUser(email: string, password: string): Promise<UserProfileData | null> {
  try {
    // Query all users to find matching email
    const usersSnapshot = await db.collection('Users').get();
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data() as UserProfileData;
      
      if (userData.EmailAddress === email && userData.PasswordHash) {
        const isValidPassword = await verifyPassword(password, userData.PasswordHash);
        
        if (isValidPassword) {
          // Update last login
          await doc.ref.update({ LastLoginAt: new Date() });
          return userData;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<UserProfileData | null> {
  try {
    const usersSnapshot = await db.collection('Users').get();
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data() as UserProfileData;
      if (userData.EmailAddress === email) {
        return userData;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

// Get user by Google ID
export async function getUserByGoogleId(googleId: string): Promise<UserProfileData | null> {
  try {
    const usersSnapshot = await db.collection('Users').get();
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data() as UserProfileData;
      if (userData.GoogleID === googleId) {
        return userData;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user by Google ID:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(userKey: string, updates: Partial<UserProfileData>): Promise<boolean> {
  try {
    await db.collection('Users').doc(`User:${userKey}`).update(updates);
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}

// Check if email already exists
export async function emailExists(email: string): Promise<boolean> {
  const user = await getUserByEmail(email);
  return user !== null;
}