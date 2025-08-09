import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signInWithPhoneNumber } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, collection as firestoreCollection } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import bcrypt from 'bcryptjs';
import { RecaptchaVerifier } from "firebase/auth";

// NOTE: Google OAuth is currently in production mode and requires verification
// This means only authorized test users can sign in until the app is verified
// To fix this: Go to Google Cloud Console > APIs & Services > OAuth consent screen
// Add test users or complete verification process

const firebaseConfig = {
  apiKey: "AIzaSyCBoEZeDucpm7p9OEDgaUGLzhn5HpItseQ",
  authDomain: "spandex-salvation-radio-site.firebaseapp.com",
  projectId: "spandex-salvation-radio-site",
  storageBucket: "spandex-salvation-radio-site.firebasestorage.app",
  appId: "1:632263635377:web:2a9bd6118a6a2cb9d8cd90",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure Google Auth Provider
const provider = new GoogleAuthProvider();
provider.addScope('profile');
provider.addScope('email');
provider.setCustomParameters({
  prompt: 'select_account'
});

// Default avatar URLs
const defaultAvatars = [
  'https://firebasestorage.googleapis.com/v0/b/spandex-salvation-radio-site.appspot.com/o/Avatars%2FBass-Bat.png?alt=media',
  'https://firebasestorage.googleapis.com/v0/b/spandex-salvation-radio-site.appspot.com/o/Avatars%2FDrum-Dragon.png?alt=media',
  'https://firebasestorage.googleapis.com/v0/b/spandex-salvation-radio-site.appspot.com/o/Avatars%2FHeadbanger-Hamster.png?alt=media',
  'https://firebasestorage.googleapis.com/v0/b/spandex-salvation-radio-site.appspot.com/o/Avatars%2FMetal-Queen.png?alt=media',
  'https://firebasestorage.googleapis.com/v0/b/spandex-salvation-radio-site.appspot.com/o/Avatars%2FMetal%20Cat.png?alt=media',
  'https://firebasestorage.googleapis.com/v0/b/spandex-salvation-radio-site.appspot.com/o/Avatars%2FMosh-Pit-Monster.png?alt=media',
  'https://firebasestorage.googleapis.com/v0/b/spandex-salvation-radio-site.appspot.com/o/Avatars%2FRebel-Raccoon.png?alt=media',
  'https://firebasestorage.googleapis.com/v0/b/spandex-salvation-radio-site.appspot.com/o/Avatars%2FRock-Unicorn.png?alt=media',
];

// User profile interface matching the new requirements
export interface UserProfile {
  firstName: string;
  lastName: string;
  userProfileImage: string;
  emailAddress: string;
  phoneNumber: string;
  location: { latitude: number; longitude: number; country?: string } | null;
  isActiveListening: boolean;
  activeSubscription: boolean;
  renewalDate: string | null;
  lastLogin: string;
  userID: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Generate 10-character alphanumeric user ID (used for non-Firebase auth flows)
function generateUserID(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Get random default avatar
export function getRandomDefaultAvatar(): string {
  const randomIndex = Math.floor(Math.random() * defaultAvatars.length);
  return defaultAvatars[randomIndex];
}

// Hash password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Compare password with hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Get user's location
export async function getUserLocation(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        resolve(null);
      }
    );
  });
}

// Initialize Admin collection in Firestore
export async function initializeAdminCollection() {
  try {
    const adminRef = doc(db, 'Admin', 'Information');
    const adminDoc = await getDoc(adminRef);
    
    if (!adminDoc.exists()) {
      // Create admin credentials
      await setDoc(adminRef, {
        Username: "adminAccess",
        Password: "password123",
        CreatedAt: new Date().toISOString(),
        UpdatedAt: new Date().toISOString(),
      });
      console.log('Admin collection initialized successfully');
    } else {
      console.log('Admin collection already exists');
    }
  } catch (error) {
    console.error('Error initializing admin collection:', error);
  }
}

// Verify admin credentials
export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  try {
    console.log('[Admin] Verifying credentials for username:', username);
    
    const adminRef = doc(db, 'Admin', 'Information');
    const adminDoc = await getDoc(adminRef);
    
    if (!adminDoc.exists()) {
      console.log('[Admin] Admin collection not found, initializing...');
      await initializeAdminCollection();
      return false;
    }
    
    const adminData = adminDoc.data();
    console.log('[Admin] Retrieved admin data:', { 
      storedUsername: adminData.Username, 
      storedPassword: adminData.Password ? '***' : 'undefined',
      providedUsername: username,
      providedPassword: password ? '***' : 'undefined'
    });
    
    const isValid = adminData.Username === username && adminData.Password === password;
    console.log('[Admin] Credentials validation result:', isValid);
    
    return isValid;
  } catch (error) {
    console.error('[Admin] Error verifying admin credentials:', error);
    return false;
  }
}

export const registerUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}) => {
  try {
    console.log('[Firebase] Starting user registration...');
    
    const response = await fetch('/api/auth/firebase/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('[Firebase] User registration successful');
      return result;
    } else {
      console.log('[Firebase] Registration failed:', result.error);
      return result;
    }
  } catch (error) {
    console.error('[Firebase] Registration error:', error);
    return {
      success: false,
      error: 'Failed to create user profile',
    };
  }
};

export async function loginUser(email: string, password: string) {
  try {
    console.log('[Firebase] Attempting login for:', email);
    
    const response = await fetch('/api/auth/firebase/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('[Firebase] Login successful for:', email);
      return result;
    } else {
      console.log('[Firebase] Login failed:', result.error);
      return result;
    }
  } catch (error) {
    console.error('[Firebase] Login error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

export async function updateUserLastActive(userID: string) {
  try {
    await updateDoc(doc(db, 'Users', `User: ${userID}`), {
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating user last active:', error);
  }
}

// Create or update user profile with all required fields (use Firebase UID as userID)
export async function createUserProfile(firebaseUser: any): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  try {
    const userID = firebaseUser.uid;
    const now = new Date().toISOString();
    
    const userProfile: UserProfile = {
      firstName: firebaseUser.displayName?.split(' ')[0] || '',
      lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
      userProfileImage: firebaseUser.photoURL || '',
      emailAddress: firebaseUser.email || '',
      phoneNumber: firebaseUser.phoneNumber || '',
      location: null, // Will be set when user grants location permission
      isActiveListening: false,
      activeSubscription: false,
      renewalDate: null,
      lastLogin: now,
      userID: userID,
      isEmailVerified: firebaseUser.emailVerified || false,
      isPhoneVerified: false,
      createdAt: now,
      updatedAt: now,
    };
    
    // Store in Firestore with the Firebase UID as document ID
    await setDoc(doc(db, 'Users', `User: ${userID}`), userProfile, { merge: true });
    
    return { success: true, profile: userProfile };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Update user's listening status
export async function updateListeningStatus(userID: string, isListening: boolean): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'Users', `User: ${userID}`), {
      isActiveListening: isListening,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error updating listening status:', error);
    return false;
  }
}

// Update user's location
export async function updateUserLocation(userID: string, location: { latitude: number; longitude: number; country?: string }): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'Users', `User: ${userID}`), {
      location: location,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error updating user location:', error);
    return false;
  }
}

// Update user's last login
export async function updateUserLastLogin(userID: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'Users', `User: ${userID}`), {
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error updating last login:', error);
    return false;
  }
}

// Get user profile by userID (Firebase UID)
export async function getUserProfile(userID: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'Users', `User: ${userID}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(userID: string, updates: Partial<UserProfile>): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'Users', `User: ${userID}`), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}

// Send email verification
export async function sendEmailVerification(): Promise<boolean> {
  try {
    const user = auth.currentUser;
    if (user) {
      // TODO: Implement email verification
      console.log('Email verification not implemented yet');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error sending email verification:', error);
    return false;
  }
}

// Send phone verification code
export async function sendPhoneVerification(phoneNumber: string): Promise<boolean> {
  try {
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
    });
    
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    // Store confirmation result for later verification
    localStorage.setItem('phoneConfirmationResult', JSON.stringify(confirmationResult));
    return true;
  } catch (error) {
    console.error('Error sending phone verification:', error);
    return false;
  }
}

// Verify phone code
export async function verifyPhoneCode(code: string): Promise<boolean> {
  try {
    const confirmationResultStr = localStorage.getItem('phoneConfirmationResult');
    if (!confirmationResultStr) return false;
    
    const confirmationResult = JSON.parse(confirmationResultStr);
    await confirmationResult.confirm(code);
    
    // Update user profile with verified phone
    const user = auth.currentUser;
    if (user) {
      const userID = user.uid;
      await updateUserProfile(userID, { isPhoneVerified: true });
    }
    
    localStorage.removeItem('phoneConfirmationResult');
    return true;
  } catch (error) {
    console.error('Error verifying phone code:', error);
    return false;
  }
}

// Get all active listeners for map display
export async function getActiveListeners(): Promise<UserProfile[]> {
  try {
    const q = query(
      collection(db, 'Users'),
      where('isActiveListening', '==', true),
      where('location', '!=', null)
    );
    
    const querySnapshot = await getDocs(q);
    const activeListeners: UserProfile[] = [];
    
    querySnapshot.forEach((doc) => {
      activeListeners.push(doc.data() as UserProfile);
    });
    
    return activeListeners;
  } catch (error) {
    console.error('Error getting active listeners:', error);
    return [];
  }
}

// Get total listeners count from Data collection
export async function getTotalListenersCount(): Promise<number> {
  try {
    const docRef = doc(db, 'Data', 'TotalListeners');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().count || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting total listeners count:', error);
    return 0;
  }
}

// Update total listeners count
export async function updateTotalListenersCount(count: number): Promise<boolean> {
  try {
    await setDoc(doc(db, 'Data', 'TotalListeners'), { count }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating total listeners count:', error);
    return false;
  }
}

// Find user by Google UID
export async function findUserByGoogleUID(googleUID: string) {
  try {
    // Since we can't query by field directly in this simple setup,
    // we'll need to maintain this lookup in our backend
    console.log('Looking up user by Google UID:', googleUID);
    return { success: false, error: 'User lookup not implemented' };
  } catch (error) {
    console.error('Error finding user by Google UID:', error);
    return { success: false, error };
  }
}

// Google Sign In
export async function signInWithGoogle() {
  try {
    console.log('Attempting Google sign-in...');
    console.log('Current domain:', window.location.hostname);
    console.log('Auth domain:', auth.config.authDomain);
    console.log('OAuth mode: Testing (should work with test users)');
    console.log('OAuth Client ID:', '632263635377-sa02i1luggs8hlmc6ivt0a6i5gv0irrn.apps.googleusercontent.com');
    console.log('Current URL:', window.location.href);
    console.log('Expected redirect URI:', `${window.location.origin}/__/auth/handler`);

    // Check if we're on an authorized domain
    const currentDomain = window.location.hostname;
    const authDomain = auth.config.authDomain;
    const authorizedDomains = [
      'localhost',
      '127.0.0.1',
      'spandex-salvation-radio-site.web.app',
      'spandex-salvation-radio.com',
      'www.spandex-salvation-radio.com',
      'spandex-salvation-radio-site.firebaseapp.com'
    ];

    if (!authorizedDomains.includes(currentDomain) && !currentDomain.includes('localhost')) {
      console.warn('Current domain may not be authorized for Google OAuth:', currentDomain);
      console.log('Available domains for testing:', authorizedDomains);
    }

    // For testing mode, we need to ensure the user is a test user
    console.log('Note: In testing mode, only authorized test users can sign in');
    console.log('Make sure your Google account is added as a test user in Google Cloud Console');

    await signInWithRedirect(auth, provider);
    console.log('Redirect initiated successfully');
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    // Provide helpful error messages for common issues
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked. Please allow popups for this site.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for Google sign-in. Please contact support.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Google sign-in is not enabled. Please contact support.');
    } else if (error.code === 'auth/access-denied') {
      throw new Error('Access denied. You may not be a test user. Please contact support to be added as a test user.');
    } else if (error.code === 'auth/redirect-cancelled-by-user') {
      throw new Error('Sign-in was cancelled during redirect. Please try again.');
    } else if (error.code === 'auth/redirect-operation-pending') {
      throw new Error('A redirect operation is already in progress. Please wait.');
    } else {
      throw new Error(`Sign-in failed: ${error.message || 'Unknown error'}`);
    }
  }
}

// Handle redirect result
export async function handleRedirectResult() {
  try {
    console.log('Checking for Google sign-in redirect result...');
    console.log('Current URL:', window.location.href);
    console.log('Has URL parameters:', window.location.search.length > 0);
    console.log('URL search params:', window.location.search);

    const result = await getRedirectResult(auth);
    console.log('Redirect result:', result);

    if (result) {
      const user = result.user;
      console.log('Google sign-in successful:', user);
      console.log('User email:', user.email);
      console.log('User display name:', user.displayName);
      console.log('User UID:', user.uid);

      // Call server API to create or update user profile
      const response = await fetch('/api/auth/firebase/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: user.uid,
          email: user.email,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        }),
      });

      const profileResult = await response.json();
      console.log('Profile creation result:', profileResult);
      return { success: true, user, profileResult };
    }
    console.log('No redirect result found');
    console.log('This could mean:');
    console.log('1. User cancelled the sign-in');
    console.log('2. User is not a test user (in testing mode)');
    console.log('3. Domain is not authorized');
    console.log('4. OAuth configuration issue');
    return { success: false, error: 'No redirect result' };
  } catch (error: any) {
    console.error('Error handling redirect result:', error);

    // Provide specific error messages
    if (error.code === 'auth/account-exists-with-different-credential') {
      return { success: false, error: 'An account already exists with this email using a different sign-in method.' };
    } else if (error.code === 'auth/invalid-credential') {
      return { success: false, error: 'Invalid credentials. Please try again.' };
    } else if (error.code === 'auth/operation-not-allowed') {
      return { success: false, error: 'Google sign-in is not enabled. Please contact support.' };
    } else if (error.code === 'auth/user-disabled') {
      return { success: false, error: 'This account has been disabled.' };
    } else if (error.code === 'auth/user-not-found') {
      return { success: false, error: 'User not found. Please try signing in again.' };
    } else if (error.code === 'auth/weak-password') {
      return { success: false, error: 'Password is too weak.' };
    } else if (error.code === 'auth/access-denied') {
      return { success: false, error: 'Access denied. You may not be a test user. Please contact support to be added as a test user.' };
    } else {
      return { success: false, error: error.message || 'Unknown error occurred during sign-in.' };
    }
  }
}

// Fetch all users with IsActiveListening: true and a valid Location
export async function getActiveListenersFromFirestore() {
  try {
    const q = query(
      firestoreCollection(db, "Users"),
      where("IsActiveListening", "==", true),
      // Firestore does not support querying for non-null objects, so filter after fetch
    );
    const querySnapshot = await getDocs(q);
    const listeners = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.Location && typeof data.Location.lat === "number" && typeof data.Location.lng === "number") {
        listeners.push({
          id: doc.id,
          ...data,
        });
      }
    });
    return listeners;
  } catch (error) {
    console.error("Error fetching active listeners from Firestore:", error);
    return [];
  }
}

export { provider };