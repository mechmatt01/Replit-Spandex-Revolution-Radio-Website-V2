import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, registerUser, loginUser, getUserProfile, updateUserProfile, updateListeningStatus, updateUserLocation } from '../lib/firebase';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';

interface User {
  UserID: string;
  FirstName: string;
  LastName: string;
  UserProfileImage: string;
  EmailAddress: string;
  PhoneNumber: string;
  Location: { lat: number; lng: number; country?: string } | null;
  IsActiveListening: boolean;
  ActiveSubscription: boolean;
  RenewalDate: string | null;
  EmailVerified: boolean;
  PhoneVerified: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

interface FirebaseAuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateListeningStatus: (isActiveListening: boolean) => Promise<void>;
  updateLocation: (location: { lat: number; lng: number; country?: string }) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  registerUser: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) => Promise<{ success: boolean; userID?: string; profile?: User; error?: string }>;
  loginUser: (email: string, password: string) => Promise<{ success: boolean; userID?: string; profile?: User; error?: string }>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

interface FirebaseAuthProviderProps {
  children: React.ReactNode;
}

export const FirebaseAuthProvider: React.FC<FirebaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
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
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
        }
      } else {
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
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateListeningStatus = async (isActiveListening: boolean) => {
    if (!user) return;
    
    try {
      // TODO: Implement listening status update
      console.log('Listening status update not implemented yet');
      setUser({ ...user, IsActiveListening: isActiveListening });
    } catch (error) {
      console.error('Error updating listening status:', error);
    }
  };

  const updateLocation = async (location: { lat: number; lng: number; country?: string }) => {
    if (!user) return;
    
    try {
      // TODO: Implement location update
      console.log('Location update not implemented yet');
      setUser({ ...user, Location: location });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      // TODO: Implement profile update
      console.log('Profile update not implemented yet');
      setUser({ ...user, ...updates });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const registerUserFunction = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) => {
    try {
      const result = await registerUser(userData);
      if (result.success && result.profile) {
        setUser(result.profile);
      }
      return result;
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  const loginUserFunction = async (email: string, password: string) => {
    try {
      const result = await loginUser(email, password);
      if (result.success && result.profile) {
        setUser(result.profile);
      }
      return result;
    } catch (error) {
      console.error('Error logging in user:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const value: FirebaseAuthContextType = {
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

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};