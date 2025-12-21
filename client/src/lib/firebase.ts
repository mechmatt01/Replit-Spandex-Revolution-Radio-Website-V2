import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, signInWithPhoneNumber, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, collection as firestoreCollection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import bcrypt from 'bcryptjs';
import { RecaptchaVerifier } from "firebase/auth";
import { auth, db, storage } from '../firebase';

// NOTE: Google OAuth is currently in production mode and requires verification
// This means only authorized test users can sign in until the app is verified
// To fix this: Go to Google Cloud Console > APIs & Services > OAuth consent screen
// Add test users or complete verification process

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
  firebaseUID: string; // Add Firebase UID for easier lookup
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Generate 10-character alphanumeric user ID
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

export async function registerUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}) {
  try {
    console.log('[Firebase] Attempting registration for:', userData.email);
    
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, {
      displayName: `${userData.firstName} ${userData.lastName}`,
    });
    
    // Create user profile in Firestore
    const profileResult = await createUserProfile(user, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber
    });
    
    if (profileResult.success) {
      console.log('[Firebase] Registration successful for:', userData.email);
      return {
        success: true,
        userID: profileResult.profile?.userID,
        profile: profileResult.profile,
      };
    } else {
      console.log('[Firebase] Profile creation failed:', profileResult.error);
      return {
        success: false,
        error: profileResult.error || 'Failed to create user profile',
      };
    }
  } catch (error: any) {
    console.error('[Firebase] Registration error:', error);
    return {
      success: false,
      error: 'Failed to create user profile',
    };
  }
};

// Remove the loginUser function - Firebase Auth handles this automatically

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

// Create or update user profile with all required fields
export async function createUserProfile(firebaseUser: any, additionalData?: { firstName?: string; lastName?: string; phoneNumber?: string }): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  try {
    const userID = generateUserID();
    const now = new Date().toISOString();
    
    // Use additional data if provided, otherwise fall back to Firebase user data
    const firstName = additionalData?.firstName || firebaseUser.displayName?.split(' ')[0] || '';
    const lastName = additionalData?.lastName || firebaseUser.displayName?.slice(1).join(' ') || '';
    const phoneNumber = additionalData?.phoneNumber || firebaseUser.phoneNumber || '';
    
    const userProfile: UserProfile = {
      firstName,
      lastName,
      userProfileImage: getProfileImageWithFallback(null, firebaseUser.photoURL),
      emailAddress: firebaseUser.email || '',
      phoneNumber,
      location: null, // Will be set when user grants location permission
      isActiveListening: false,
      activeSubscription: false,
      renewalDate: null,
      lastLogin: now,
      userID: userID,
      firebaseUID: firebaseUser.uid,
      isEmailVerified: firebaseUser.emailVerified || false,
      isPhoneVerified: false,
      createdAt: now,
      updatedAt: now,
    };
    
    // Store in Firestore with the userID as document ID
    await setDoc(doc(db, 'Users', `User: ${userID}`), userProfile);
    
    return { success: true, profile: userProfile };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

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

// Get user profile by userID
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

// Find user profile by Firebase UID (searches by email since that's what we store)
export async function findUserProfileByFirebaseUID(firebaseUID: string, email: string): Promise<UserProfile | null> {
  try {
    // First try to find by Firebase UID
    const q1 = query(
      collection(db, 'Users'),
      where('firebaseUID', '==', firebaseUID)
    );
    
    let querySnapshot = await getDocs(q1);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return userDoc.data() as UserProfile;
    }
    
    // Fallback: Query by email address
    const q2 = query(
      collection(db, 'Users'),
      where('emailAddress', '==', email)
    );
    
    querySnapshot = await getDocs(q2);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return userDoc.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding user profile by Firebase UID:', error);
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

    // Check if we're on an authorized domain
    const currentDomain = window.location.hostname;
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

    // Use popup authentication for better user experience
    const result = await signInWithPopup(auth, provider);
    console.log('Google sign-in successful:', result);
    
    return result;
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

      // Create or update user profile in Firestore directly
      try {
        const profileResult = await createUserProfile(user);
        console.log('Profile creation result:', profileResult);
        return { success: true, user, profileResult };
      } catch (profileError) {
        console.error('Error creating user profile:', profileError);
        // Still return success for the auth, but log the profile error
        return { success: true, user, profileError: profileError instanceof Error ? profileError.message : 'Unknown profile error' };
      }
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
    const listeners: (Partial<UserProfile> & { id?: string })[] = [];
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

// Upload image to Firebase Storage
export async function uploadProfileImage(file: File, userID: string): Promise<string> {
  try {
    // Create a unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile-images/${userID}-${Date.now()}.${fileExtension}`;
    
    // Create a reference to the file location
    const storageRef = ref(storage, fileName);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw new Error('Failed to upload image');
  }
}

// Delete user profile completely
export async function deleteUserProfile(userID: string): Promise<boolean> {
  try {
    console.log('[Firebase] Attempting to delete user profile:', userID);
    
    // Delete the user profile document from Firestore
    await setDoc(doc(db, 'Users', `User: ${userID}`), {}, { merge: false });
    
    // Note: We don't delete the Firebase Auth user here as that requires admin privileges
    // The user will need to manually delete their account from Firebase Console or contact support
    
    console.log('[Firebase] User profile deleted successfully:', userID);
    return true;
  } catch (error) {
    console.error('[Firebase] Error deleting user profile:', error);
    return false;
  }
}

// Delete user account completely (requires admin privileges)
export async function deleteUserAccount(userID: string): Promise<boolean> {
  try {
    console.log('[Firebase] Attempting to delete user account:', userID);
    
    // First delete the profile
    const profileDeleted = await deleteUserProfile(userID);
    if (!profileDeleted) {
      throw new Error('Failed to delete user profile');
    }
    
    // Note: Deleting the Firebase Auth user requires admin privileges
    // This would typically be done server-side with admin SDK
    console.log('[Firebase] User account deletion initiated. Profile deleted, but Firebase Auth user remains.');
    console.log('[Firebase] User must contact support to completely remove their account.');
    
    return true;
  } catch (error) {
    console.error('[Firebase] Error deleting user account:', error);
    return false;
  }
}

export { provider };

// Get profile image with proper fallback priority
export function getProfileImageWithFallback(
  customProfileImage: string | null | undefined,
  googlePhotoURL: string | null | undefined
): string {
  // Priority 1: Custom profile image (if exists and valid)
  if (customProfileImage && customProfileImage.trim() !== '') {
    return customProfileImage;
  }
  
  // Priority 2: Google profile image (if exists and valid)
  if (googlePhotoURL && googlePhotoURL.trim() !== '') {
    return googlePhotoURL;
  }
  
  // Priority 3: Default avatar
  return getRandomDefaultAvatar();
}