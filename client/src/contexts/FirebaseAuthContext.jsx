import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, registerUser, loginUser, updateUserProfile, updateUserLocation } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
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
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setFirebaseUser(firebaseUser);
            if (firebaseUser) {
                try {
                    // Get user profile from our database using the email
                    const userData = await loginUser(firebaseUser.email || '', '');
                    if (userData.success && userData.profile) {
                        setUser(userData.profile);
                    }
                }
                catch (error) {
                    console.error('Error fetching user profile:', error);
                    setUser(null);
                }
            }
            else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    const signOut = async () => {
        try {
            await auth.signOut();
            setUser(null);
            setFirebaseUser(null);
        }
        catch (error) {
            console.error('Error signing out:', error);
        }
    };
    const updateListeningStatus = async (isActiveListening) => {
        if (!user)
            return;
        try {
            const result = await updateListeningStatus(user.UserID, isActiveListening);
            if (result.success) {
                setUser({ ...user, IsActiveListening: isActiveListening });
            }
        }
        catch (error) {
            console.error('Error updating listening status:', error);
        }
    };
    const updateLocation = async (location) => {
        if (!user)
            return;
        try {
            const result = await updateUserLocation(user.UserID);
            if (result.success) {
                setUser({ ...user, Location: location });
            }
        }
        catch (error) {
            console.error('Error updating location:', error);
        }
    };
    const updateProfile = async (updates) => {
        if (!user)
            return;
        try {
            const result = await updateUserProfile(user.UserID, updates);
            if (result.success) {
                setUser({ ...user, ...updates });
            }
        }
        catch (error) {
            console.error('Error updating profile:', error);
        }
    };
    const registerUserFunction = async (userData) => {
        try {
            const result = await registerUser(userData);
            if (result.success && result.profile) {
                setUser(result.profile);
            }
            return result;
        }
        catch (error) {
            console.error('Error registering user:', error);
            return { success: false, error: 'Registration failed' };
        }
    };
    const loginUserFunction = async (email, password) => {
        try {
            const result = await loginUser(email, password);
            if (result.success && result.profile) {
                setUser(result.profile);
            }
            return result;
        }
        catch (error) {
            console.error('Error logging in user:', error);
            return { success: false, error: 'Login failed' };
        }
    };
    const value = {
        user,
        firebaseUser,
        loading,
        signOut,
        updateListeningStatus,
        updateLocation,
        updateProfile,
        registerUser: registerUserFunction,
        loginUser: loginUserFunction,
    };
    return (<FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>);
};
