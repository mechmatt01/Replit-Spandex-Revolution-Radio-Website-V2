import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import bcrypt from 'bcryptjs';

// Initialize Firebase Admin (if not already initialized)
if (!getApps().length) {
  try {
    // Try to get service account from environment variables first
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
    let serviceAccount;
    
    if (serviceAccountEnv) {
      // Parse service account from environment variable
      serviceAccount = JSON.parse(serviceAccountEnv);
    } else {
      // Fallback to file (for local development)
      serviceAccount = require('../firebase-service-account.json');
      console.warn('⚠️ Using service account file. Consider moving to environment variables for production.');
    }
    
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'spandex-salvation-radio-site.firebasestorage.app'
    });
    
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    console.error('💡 Make sure FIREBASE_SERVICE_ACCOUNT secret is set in Replit Secrets');
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

// Generate random 10-character alphanumeric user ID
const generateUserID = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Get random avatar from the available options
const getRandomAvatar = (): string => {
  const avatars = [
    'Bass-Bat.png',
    'Drum-Dragon.png',
    'Headbanger-Hamster.png',
    'Metal-Queen.png',
    'Metal Cat.png',
    'Mosh-Pit-Monster.png',
    'Rebel-Raccoon.png',
    'Rock-Unicorn.png'
  ];
  const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
  return `https://firebasestorage.googleapis.com/v0/b/spandex-salvation-radio-site.firebasestorage.app/o/Avatars%2F${encodeURIComponent(randomAvatar)}?alt=media`;
};

// Register a new user
export async function registerFirebaseUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}) {
  try {
    console.log('[Firebase Auth] Starting registration for:', userData.email);

    // Check if user already exists
    const existingUsers = await db.collection('Users').where('EmailAddress', '==', userData.email).get();
    if (!existingUsers.empty) {
      console.log('[Firebase Auth] User already exists:', userData.email);
      return { success: false, error: 'An account with this email already exists. Please try logging in instead.' };
    }

    // Generate a random 10-character alphanumeric user ID
    let userID = generateUserID();

    // Ensure userID is unique
    let userExists = true;
    while (userExists) {
      const existingUser = await db.collection('Users').doc(userID).get();
      if (!existingUser.exists) {
        userExists = false;
      } else {
        userID = generateUserID();
      }
    }

    console.log('[Firebase Auth] Generated unique UserID:', userID);

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Get random avatar
    const randomAvatarUrl = getRandomAvatar();

    // Create user profile data
    const userProfile = {
      FirstName: userData.firstName || '',
      LastName: userData.lastName || '',
      UserProfileImage: randomAvatarUrl,
      EmailAddress: userData.email,
      PhoneNumber: userData.phoneNumber || '',
      Location: null, // Will be set later when user allows location access
      IsActiveListening: false,
      ActiveSubscription: false,
      RenewalDate: null,
      UserID: userID,
      Password: hashedPassword,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString()
    };

    // Save to Firestore under Users/{UserID}
    await db.collection('Users').doc(userID).set(userProfile);
    console.log('[Firebase Auth] User profile created successfully with ID:', userID);

    // Remove password from response
    const { Password, ...profileWithoutPassword } = userProfile;

    return {
      success: true,
      userID,
      profile: profileWithoutPassword
    };

  } catch (error: any) {
    console.error('[Firebase Auth] Registration error:', error);
    return { 
      success: false, 
      error: error.message || 'Registration failed. Please try again.' 
    };
  }
}

// Login user with email and password
export async function loginFirebaseUser(email: string, password: string) {
  try {
    console.log('[Firebase Auth] Attempting login for:', email);

    // Find user by email
    const userQuery = await db.collection('Users').where('EmailAddress', '==', email).get();

    if (userQuery.empty) {
      console.log('[Firebase Auth] User not found:', email);
      return { success: false, error: 'No account found with this email address. Please check your email or create a new account.' };
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userData.Password);

    if (!isPasswordValid) {
      console.log('[Firebase Auth] Invalid password for:', email);
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Update last login time
    await db.collection('Users').doc(userData.UserID).update({
      UpdatedAt: new Date().toISOString(),
      LastLoginAt: new Date().toISOString()
    });

    console.log('[Firebase Auth] Login successful for:', email);

    // Remove password from response
    const { Password, ...profileWithoutPassword } = userData;

    return {
      success: true,
      userID: userData.UserID,
      profile: profileWithoutPassword
    };

  } catch (error: any) {
    console.error('[Firebase Auth] Login error:', error);
    return { 
      success: false, 
      error: error.message || 'Login failed. Please try again.' 
    };
  }
}