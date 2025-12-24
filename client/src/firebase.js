import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendEmailVerification, sendPasswordResetEmail, updateProfile, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
// Note: firebase performance may be unavailable in some environments (SSR, workers).
// Use a dynamic import to avoid breaking initialization when window is not present.
let getPerformanceSafe = null;
(async () => {
    try {
        const mod = await import('firebase/performance');
        getPerformanceSafe = mod.getPerformance;
    } catch (e) {
        // ignore - performance will be skipped
        getPerformanceSafe = null;
    }
})();
// Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
// Initialize Firebase
let app;
try {
    app = initializeApp(firebaseConfig);
}
catch (error) {
    if (error.code === 'app/duplicate-app') {
        // Firebase already initialized, get the existing app
        app = initializeApp(firebaseConfig, 'spandex-radio-app');
    }
    else {
        console.error('Firebase initialization error:', error);
        throw error;
    }
}
// Initialize Firebase services with proper error handling
let auth;
let db;
let storage;
let performance;
try {
    // Initialize auth first
    auth = getAuth(app);
    // Initialize other services
    db = getFirestore(app);
    storage = getStorage(app);
    // Initialize Performance Monitoring only if available and running in a browser
    if (typeof window !== 'undefined' && getPerformanceSafe) {
        try {
            performance = getPerformanceSafe(app);
        } catch (perfErr) {
            console.warn('Firebase Performance init failed, skipping:', perfErr);
            performance = null;
        }
    } else {
        performance = null;
    }
    // Connect to emulators in development if needed
    if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
        try {
            connectAuthEmulator(auth, 'http://localhost:9099');
            connectFirestoreEmulator(db, 'localhost', 8080);
            connectStorageEmulator(storage, 'localhost', 9199);
            // Note: Performance Monitoring doesn't have an emulator, so we skip it
        }
        catch (emulatorError) {
            console.warn('Failed to connect to Firebase emulators:', emulatorError);
        }
    }
}
catch (error) {
    console.error('Error initializing Firebase services:', error);
    throw error;
}
// Function to ensure Firebase is fully initialized
export const ensureFirebaseInitialized = () => {
    if (!auth || !db || !storage || !performance) {
        throw new Error('Firebase services not properly initialized');
    }
    return { auth, db, storage, performance };
};
// Export the initialized services
export { auth, db, storage, performance };
// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
// Authentication functions
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result;
    }
    catch (error) {
        console.error('Google sign-in error:', error);
        throw error;
    }
};
export const signUpWithEmail = async (email, password, firstName, lastName) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Update profile with name
        await updateProfile(result.user, {
            displayName: `${firstName} ${lastName}`
        });
        // Send email verification
        await sendEmailVerification(result.user);
        return result;
    }
    catch (error) {
        console.error('Email sign-up error:', error);
        throw error;
    }
};
export const signInWithEmail = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result;
    }
    catch (error) {
        console.error('Email sign-in error:', error);
        throw error;
    }
};
export const sendPasswordReset = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
    }
    catch (error) {
        console.error('Password reset error:', error);
        throw error;
    }
};
// Get current user ID token for API calls
export const getIdToken = async () => {
    const user = auth.currentUser;
    if (user) {
        return await user.getIdToken();
    }
    return null;
};
// API call helper with authentication
export const authenticatedApiCall = async (url, options = {}) => {
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
// Note: Functions from lib/firebase are imported directly where needed
// to avoid circular dependencies that can cause auth service initialization issues 
