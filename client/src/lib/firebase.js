import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
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
// Generate 10-character alphanumeric user ID
export function generateUserID() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
// Get user's location
export async function getUserLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }
        navigator.geolocation.getCurrentPosition((position) => {
            resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            });
        }, () => {
            resolve(null);
        });
    });
}
// Create user profile in Firebase
export async function createUserProfile(authUser, customUserID) {
    try {
        const userID = customUserID || generateUserID();
        const location = await getUserLocation();
        const userProfile = {
            FirstName: authUser.displayName?.split(' ')[0] || '',
            LastName: authUser.displayName?.split(' ').slice(1).join(' ') || '',
            UserProfileImage: authUser.photoURL || '',
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
        };
        // Save to Firebase Firestore
        await setDoc(doc(db, 'Users', `User: ${userID}`), userProfile);
        console.log('User profile created successfully:', userID);
        return { success: true, userID, profile: userProfile };
    }
    catch (error) {
        console.error('Error creating user profile:', error);
        return { success: false, error };
    }
}
// Get user profile from Firebase
export async function getUserProfile(userID) {
    try {
        const docRef = doc(db, 'Users', `User: ${userID}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { success: true, profile: docSnap.data() };
        }
        else {
            return { success: false, error: 'Profile not found' };
        }
    }
    catch (error) {
        console.error('Error getting user profile:', error);
        return { success: false, error };
    }
}
// Update user profile in Firebase
export async function updateUserProfile(userID, updates) {
    try {
        const docRef = doc(db, 'Users', `User: ${userID}`);
        const updateData = {
            ...updates,
            UpdatedAt: new Date().toISOString(),
        };
        await updateDoc(docRef, updateData);
        console.log('User profile updated successfully');
        return { success: true };
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        return { success: false, error };
    }
}
// Upload profile image to Firebase Storage
export async function uploadProfileImage(userID, file) {
    try {
        const storageRef = ref(storage, `User: ${userID}/profile-image`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        // Update profile with new image URL
        await updateUserProfile(userID, { UserProfileImage: downloadURL });
        return { success: true, url: downloadURL };
    }
    catch (error) {
        console.error('Error uploading profile image:', error);
        return { success: false, error };
    }
}
// Update listening status
export async function updateListeningStatus(userID, isListening) {
    try {
        await updateUserProfile(userID, { IsActiveListening: isListening });
        return { success: true };
    }
    catch (error) {
        console.error('Error updating listening status:', error);
        return { success: false, error };
    }
}
// Update location
export async function updateUserLocation(userID) {
    try {
        const location = await getUserLocation();
        if (location) {
            await updateUserProfile(userID, { Location: location });
            return { success: true };
        }
        return { success: false, error: 'Location not available' };
    }
    catch (error) {
        console.error('Error updating location:', error);
        return { success: false, error };
    }
}
// Find user by Google UID
export async function findUserByGoogleUID(googleUID) {
    try {
        // Since we can't query by field directly in this simple setup,
        // we'll need to maintain this lookup in our backend
        console.log('Looking up user by Google UID:', googleUID);
        return { success: false, error: 'User lookup not implemented' };
    }
    catch (error) {
        console.error('Error finding user by Google UID:', error);
        return { success: false, error };
    }
}
// Google Sign In
export async function signInWithGoogle() {
    try {
        await signInWithRedirect(auth, provider);
    }
    catch (error) {
        console.error('Error signing in with Google:', error);
        throw error;
    }
}
// Handle redirect result
export async function handleRedirectResult() {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            const user = result.user;
            console.log('Google sign-in successful:', user);
            // Create or update user profile
            const profileResult = await createUserProfile(user);
            return { success: true, user, profileResult };
        }
        return { success: false, error: 'No redirect result' };
    }
    catch (error) {
        console.error('Error handling redirect result:', error);
        return { success: false, error };
    }
}
export { provider };
