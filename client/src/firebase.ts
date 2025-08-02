import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBoEZeDucpm7p9OEDgaUGLzhn5HpItseQ",
  authDomain: "spandex-salvation-radio-site.firebaseapp.com",
  projectId: "spandex-salvation-radio-site",
  storageBucket: "spandex-salvation-radio-site.firebasestorage.app",
  messagingSenderId: "116886458372694977017",
  appId: "1:632263635377:web:2a9bd6118a6a2cb9d8cd90"
};

// Initialize Firebase only if not already initialized
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error: any) {
  if (error.code === 'app/duplicate-app') {
    // Firebase already initialized, get the existing app
    app = initializeApp(firebaseConfig, 'spandex-radio-app');
  } else {
    throw error;
  }
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string, firstName: string, lastName: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with name
    await updateProfile(result.user, {
      displayName: `${firstName} ${lastName}`
    });
    
    // Send email verification
    await sendEmailVerification(result.user);
    
    return result;
  } catch (error) {
    console.error('Email sign-up error:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error) {
    console.error('Email sign-in error:', error);
    throw error;
  }
};

export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

// Get current user ID token for API calls
export const getIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

// API call helper with authentication
export const authenticatedApiCall = async (url: string, options: RequestInit = {}) => {
  const token = await getIdToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  return response.json();
};

// Import and re-export functions from the existing Firebase configuration
import { 
  handleRedirectResult as handleRedirectResultOriginal,
  createUserProfile as createUserProfileOriginal,
  getUserProfile as getUserProfileOriginal,
  updateUserProfile as updateUserProfileOriginal,
  uploadProfileImage as uploadProfileImageOriginal,
  updateListeningStatus as updateListeningStatusOriginal,
  updateUserLocation as updateUserLocationOriginal,
  loginUser as loginUserOriginal,
  registerUser as registerUserOriginal,
  getActiveListenersFromFirestore as getActiveListenersFromFirestoreOriginal
} from './lib/firebase';

// Re-export the functions with the same names
export const handleRedirectResult = handleRedirectResultOriginal;
export const createUserProfile = createUserProfileOriginal;
export const getUserProfile = getUserProfileOriginal;
export const updateUserProfile = updateUserProfileOriginal;
export const uploadProfileImage = uploadProfileImageOriginal;
export const updateListeningStatus = updateListeningStatusOriginal;
export const updateUserLocation = updateUserLocationOriginal;
export const loginUser = loginUserOriginal;
export const registerUser = registerUserOriginal;
export const getActiveListenersFromFirestore = getActiveListenersFromFirestoreOriginal; 