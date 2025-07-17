import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail
} from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase with error handling
let app: any;
let auth: any;
let db: any;
let storage: any;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Create fallback objects to prevent app crashes
  auth = null;
  db = null;
  storage = null;
}

export { auth, db, storage };

// Configure Google Auth Provider with error handling
let googleProvider: any = null;
try {
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
} catch (error) {
  console.error('Google Auth Provider initialization error:', error);
}

export { googleProvider };

// User Profile Interface
export interface UserProfile {
  UserID: string;
  authUID: string; // Firebase Auth UID
  FirstName: string;
  LastName: string;
  EmailAddress: string;
  PhoneNumber: string;
  UserProfileImage: string;
  Location: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  } | null;
  IsActiveListening: boolean;
  ActiveSubscription: boolean;
  RenewalDate: Date | null;
  CreatedAt: Date;
  UpdatedAt: Date;
  EmailVerified: boolean;
  PhoneVerified: boolean;
}

// Generate 10-character alphanumeric ID
export function generateUserID(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Get user's current location
export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
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
      },
      { timeout: 10000 }
    );
  });
}

// Create user profile in Firestore
export async function createUserProfile(user: User, profileData: Partial<UserProfile>): Promise<UserProfile> {
  if (!db) throw new Error("Firestore not initialized");
  
  const userID = generateUserID();
  const location = await getCurrentLocation();
  
  const userProfile: UserProfile = {
    UserID: userID,
    authUID: user.uid,
    FirstName: profileData.FirstName || '',
    LastName: profileData.LastName || '',
    EmailAddress: user.email || '',
    PhoneNumber: profileData.PhoneNumber || '',
    UserProfileImage: user.photoURL || '',
    Location: location,
    IsActiveListening: false,
    ActiveSubscription: false,
    RenewalDate: null,
    CreatedAt: new Date(),
    UpdatedAt: new Date(),
    EmailVerified: user.emailVerified,
    PhoneVerified: false,
  };
  
  await setDoc(doc(db, 'Users', `User:${userID}`), userProfile);
  return userProfile;
}

// Get user profile from Firestore by UserID
export async function getUserProfile(userID: string): Promise<UserProfile | null> {
  if (!db) return null;
  
  try {
    const docSnap = await getDoc(doc(db, 'Users', `User:${userID}`));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Get user profile from Firestore by Firebase Auth UID
export async function getUserProfileByAuthUID(authUID: string): Promise<UserProfile | null> {
  if (!db) return null;
  
  try {
    const usersRef = collection(db, 'Users');
    const q = query(usersRef, where('authUID', '==', authUID));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile by auth UID:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(userID: string, updates: Partial<UserProfile>): Promise<void> {
  if (!db) return;
  
  try {
    await updateDoc(doc(db, 'Users', `User:${userID}`), {
      ...updates,
      UpdatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
  }
}

// Update listening status
export async function updateListeningStatus(userID: string, isListening: boolean): Promise<void> {
  if (!db) return;
  
  try {
    await updateDoc(doc(db, 'Users', `User:${userID}`), {
      IsActiveListening: isListening,
      UpdatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating listening status:', error);
  }
}

// Update user location
export async function updateUserLocation(userID: string): Promise<void> {
  if (!db) return;
  
  try {
    const location = await getCurrentLocation();
    if (location) {
      await updateDoc(doc(db, 'Users', `User:${userID}`), {
        Location: location,
        UpdatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error updating user location:', error);
  }
}

// Upload profile image
export async function uploadProfileImage(userID: string, file: File): Promise<string> {
  if (!storage) throw new Error("Firebase Storage not initialized");
  
  try {
    const storageRef = ref(storage, `User:${userID}/profile-image.jpg`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
}

export default app;