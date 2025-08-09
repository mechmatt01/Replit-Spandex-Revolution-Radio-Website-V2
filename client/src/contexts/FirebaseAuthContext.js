import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { registerUser, findUserProfileByFirebaseUID, updateUserProfile, updateListeningStatus, updateUserLocation, createUserProfile } from '../lib/firebase';
const FirebaseAuthContext = createContext(undefined);
export const useFirebaseAuth = () => {
    const context = useContext(FirebaseAuthContext);
    if (context === undefined) {
        throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
    }
    return context;
};
export const FirebaseAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            setLoading(false);
            if (user) {
                // Update user's last active status
                try {
                    const profile = await findUserProfileByFirebaseUID(user.uid, user.email || '');
                    if (profile) {
                        // Update last login
                        await updateUserProfile(profile.userID, { lastLogin: new Date().toISOString() });
                    }
                }
                catch (error) {
                    console.error('Error updating user profile:', error);
                }
            }
        });
        return () => unsubscribe();
    }, []);
    const register = async (email, password, firstName, lastName, phoneNumber) => {
        try {
            const result = await registerUser({ firstName, lastName, email, phoneNumber, password });
            return result;
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    };
    const signIn = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    };
    const signOutUser = async () => {
        try {
            await signOut();
        }
        catch (error) {
            console.error('Error signing out:', error);
        }
    };
    const updateProfileData = async (updates) => {
        if (!user)
            return false;
        try {
            const profile = await findUserProfileByFirebaseUID(user.uid, user.email || '');
            if (profile) {
                return await updateUserProfile(profile.userID, updates);
            }
            return false;
        }
        catch (error) {
            console.error('Error updating profile:', error);
            return false;
        }
    };
    const updateListeningStatusData = async (isListening) => {
        if (!user)
            return false;
        try {
            const profile = await findUserProfileByFirebaseUID(user.uid, user.email || '');
            if (profile) {
                return await updateListeningStatus(profile.userID, isListening);
            }
            return false;
        }
        catch (error) {
            console.error('Error updating listening status:', error);
            return false;
        }
    };
    const updateLocationData = async (location) => {
        if (!user)
            return false;
        try {
            const profile = await findUserProfileByFirebaseUID(user.uid, user.email || '');
            if (profile) {
                return await updateUserLocation(profile.userID, location);
            }
            return false;
        }
        catch (error) {
            console.error('Error updating location:', error);
            return false;
        }
    };
    // Google Sign-in method
    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            // After successful Google sign-in, create or update user profile
            if (result.user) {
                try {
                    // Check if user profile already exists
                    const existingProfile = await findUserProfileByFirebaseUID(result.user.uid, result.user.email || '');
                    if (!existingProfile) {
                        // Create new user profile
                        const profileResult = await createUserProfile(result.user);
                        if (profileResult.success) {
                            console.log('Google sign-in profile created:', profileResult.profile);
                        }
                        else {
                            console.error('Failed to create profile for Google user:', profileResult.error);
                        }
                    }
                    else {
                        // Update last login for existing user
                        await updateUserProfile(existingProfile.userID, {
                            lastLogin: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        });
                    }
                }
                catch (profileError) {
                    console.error('Error handling user profile after Google sign-in:', profileError);
                }
            }
        }
        catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };
    // Alias for login method
    const login = signIn;
    // Alias for logout method
    const logout = signOutUser;
    // Alias for signOut method
    const signOut = signOutUser;
    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        register,
        signIn,
        signInWithGoogle,
        login,
        logout,
        signOutUser,
        signOut,
        updateProfile: updateProfileData,
        updateListeningStatus: updateListeningStatusData,
        updateLocation: updateLocationData,
    };
    return (_jsx(FirebaseAuthContext.Provider, { value: value, children: children }));
};
