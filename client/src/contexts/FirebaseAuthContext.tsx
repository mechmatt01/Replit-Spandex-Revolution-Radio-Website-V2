import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
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
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        try {
          // Call server to create/update user profile from Google account
          const response = await fetch('/api/auth/firebase/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              googleId: fbUser.uid,
              email: fbUser.email,
              firstName: fbUser.displayName?.split(' ')[0] || '',
              lastName: fbUser.displayName?.split(' ').slice(1).join(' ') || '',
            }),
          });
          const result = await response.json();
          if (response.ok && result?.profile) {
            setUser(result.profile);
          } else if (result?.profile) {
            setUser(result.profile);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error syncing Google auth profile:', error);
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
    setUser({ ...user, IsActiveListening: isActiveListening });
  };

  const updateLocation = async (location: { lat: number; lng: number; country?: string }) => {
    if (!user) return;
    setUser({ ...user, Location: location });
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  const value: FirebaseAuthContextType = {
    user,
    firebaseUser,
    loading,
    signOut,
    updateListeningStatus,
    updateLocation,
    updateProfile,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};