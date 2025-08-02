import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, collection as firestoreCollection } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import bcrypt from 'bcryptjs';

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
export async function getUserLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
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
    const adminRef = doc(db, 'Admin', 'Information');
    const adminDoc = await getDoc(adminRef);
    
    if (!adminDoc.exists()) {
      console.log('Admin collection not found, initializing...');
      await initializeAdminCollection();
      return false;
    }
    
    const adminData = adminDoc.data();
    return adminData.Username === username && adminData.Password === password;
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return false;
  }
}

// Register new user with email/password
export const registerUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}) => {
  try {
    console.log('[Firebase] Attempting to register user:', userData.email);

    const response = await fetch('/api/auth/firebase/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[Firebase] Registration failed:', result);
      return { success: false, error: result.error || 'Registration failed' };
    }

    console.log('[Firebase] Registration successful:', result);
    return { 
      success: true, 
      userID: result.userID,
      profile: result.profile
    };
  } catch (error: any) {
    console.error('[Firebase] Registration error:', error);
    return { success: false, error: error.message || 'Registration failed' };
  }
};

// Login user with email/password
export async function loginUser(email: string, password: string) {
  try {
    console.log('Attempting login for:', email);

    // Query Firestore to find user by email
    const usersRef = collection(db, 'Users');
    const q = query(usersRef, where('EmailAddress', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('No user found with email:', email);
      return { success: false, error: 'Invalid email or password' };
    }

    // Get the first matching user (should be unique)
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Verify password
    const isPasswordValid = await comparePassword(password, userData.PasswordHash);

    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return { success: false, error: 'Invalid email or password' };
    }

    // Update last active timestamp
    await updateUserLastActive(userData.UserID);

    console.log('Login successful for user:', userData.UserID);
    return { 
      success: true, 
      userID: userData.UserID,
      profile: {
        FirstName: userData.FirstName,
        LastName: userData.LastName,
        UserProfileImage: userData.UserProfileImage,
        EmailAddress: userData.EmailAddress,
        PhoneNumber: userData.PhoneNumber,
        Location: userData.Location,
        IsActiveListening: userData.IsActiveListening,
        ActiveSubscription: userData.ActiveSubscription,
        RenewalDate: userData.RenewalDate,
        UserID: userData.UserID,
      }
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    return { success: false, error };
  }
}

// Update user's last active timestamp
export async function updateUserLastActive(userID: string) {
  try {
    const docRef = doc(db, 'Users', `User: ${userID}`);
    await updateDoc(docRef, {
      LastActive: new Date().toISOString(),
    });
    console.log('User last active timestamp updated');
  } catch (error) {
    console.error('Error updating user last active:', error);
  }
}

// Get user profile by UserID
export async function getUserProfile(userID: string) {
  try {
    const userDoc = await getDoc(doc(db, 'Users', `User: ${userID}`));

    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    return { 
      success: true, 
      profile: {
        FirstName: userData.FirstName,
        LastName: userData.LastName,
        UserProfileImage: userData.UserProfileImage,
        EmailAddress: userData.EmailAddress,
        PhoneNumber: userData.PhoneNumber,
        Location: userData.Location,
        IsActiveListening: userData.IsActiveListening,
        ActiveSubscription: userData.ActiveSubscription,
        RenewalDate: userData.RenewalDate,
        UserID: userData.UserID,
      }
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error };
  }
}

// Create user profile in Firebase (for Google OAuth)
export async function createUserProfile(authUser: any, customUserID?: string) {
  try {
    const userID = customUserID || generateUserID();
    const location = await getUserLocation();

    const userProfile = {
      FirstName: authUser.displayName?.split(' ')[0] || '',
      LastName: authUser.displayName?.split(' ').slice(1).join(' ') || '',
      UserProfileImage: authUser.photoURL || getRandomDefaultAvatar(),
      EmailAddress: authUser.email || '',
      PhoneNumber: authUser.phoneNumber || '',
      Location: location ? { lat: location.lat, lng: location.lng } : null,
      IsActiveListening: false,
      ActiveSubscription: false,
      RenewalDate: null,
      UserID: userID,
      GoogleUID: authUser.uid,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
      LastActive: new Date().toISOString(),
    };

    // Save to Firebase Firestore
    await setDoc(doc(db, 'Users', `User: ${userID}`), userProfile);

    console.log('User profile created successfully:', userID);
    return { success: true, userID, profile: userProfile };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error };
  }
}

// Update user profile in Firebase
export async function updateUserProfile(userID: string, updates: any) {
  try {
    const docRef = doc(db, 'Users', `User: ${userID}`);
    const updateData = {
      ...updates,
      UpdatedAt: new Date().toISOString(),
    };

    await updateDoc(docRef, updateData);
    console.log('User profile updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error };
  }
}

// Upload profile image to Firebase Storage
export async function uploadProfileImage(userID: string, file: File) {
  try {
    const storageRef = ref(storage, `User: ${userID}/profile-image`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Update profile with new image URL
    await updateUserProfile(userID, { UserProfileImage: downloadURL });

    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return { success: false, error };
  }
}

// Update listening status
export async function updateListeningStatus(userID: string, isListening: boolean) {
  try {
    await updateUserProfile(userID, { 
      IsActiveListening: isListening,
      LastActive: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating listening status:', error);
    return { success: false, error };
  }
}

// Update location
export async function updateUserLocation(userID: string) {
  try {
    const location = await getUserLocation();
    if (location) {
      await updateUserProfile(userID, { 
        Location: location,
        LastActive: new Date().toISOString(),
      });
      return { success: true };
    }
    return { success: false, error: 'Location not available' };
  } catch (error) {
    console.error('Error updating location:', error);
    return { success: false, error };
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

      // Create or update user profile
      const profileResult = await createUserProfile(user);
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