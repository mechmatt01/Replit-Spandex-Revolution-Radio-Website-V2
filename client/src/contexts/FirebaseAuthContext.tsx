import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { 
  registerUser, 
  findUserProfileByFirebaseUID, 
  updateUserProfile, 
  updateListeningStatus, 
  updateUserLocation, 
  createUserProfile 
} from '../lib/firebase';

interface FirebaseAuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  register: (email: string, password: string, firstName: string, lastName: string, phoneNumber: string) => Promise<{ success: boolean; userID?: string; profile?: any; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signOutUser: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<boolean>;
  updateListeningStatus: (isListening: boolean) => Promise<boolean>;
  updateLocation: (location: { latitude: number; longitude: number; country?: string }) => Promise<boolean>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
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
        } catch (error) {
          console.error('Error updating user profile:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, firstName: string, lastName: string, phoneNumber: string) => {
    try {
      const result = await registerUser({ firstName, lastName, email, phoneNumber, password });
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signOutUser = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfileData = async (updates: any) => {
    if (!user) return false;
    try {
      const profile = await findUserProfileByFirebaseUID(user.uid, user.email || '');
      if (profile) {
        return await updateUserProfile(profile.userID, updates);
      }
      return false;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const updateListeningStatusData = async (isListening: boolean) => {
    if (!user) return false;
    try {
      const profile = await findUserProfileByFirebaseUID(user.uid, user.email || '');
      if (profile) {
        return await updateListeningStatus(profile.userID, isListening);
      }
      return false;
    } catch (error) {
      console.error('Error updating listening status:', error);
      return false;
    }
  };

  const updateLocationData = async (location: { latitude: number; longitude: number; country?: string }) => {
    if (!user) return false;
    try {
      const profile = await findUserProfileByFirebaseUID(user.uid, user.email || '');
      if (profile) {
        return await updateUserLocation(profile.userID, location);
      }
      return false;
    } catch (error) {
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
            } else {
              console.error('Failed to create profile for Google user:', profileResult.error);
            }
          } else {
            // Update last login for existing user
            await updateUserProfile(existingProfile.userID, { 
              lastLogin: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        } catch (profileError) {
          console.error('Error handling user profile after Google sign-in:', profileError);
        }
      }
    } catch (error: any) {
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

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};