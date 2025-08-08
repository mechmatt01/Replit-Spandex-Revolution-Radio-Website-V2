import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { auth, handleRedirectResult, signInWithGoogle, createUserProfile, getUserProfile, updateUserProfile, updateListeningStatus, updateUserLocation, updateUserLastLogin, getActiveListeners, getTotalListenersCount } from "../lib/firebase";
import { getRedirectResult } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useToast } from "../hooks/use-toast";

interface User {
  userID: string;
  firstName: string;
  lastName: string;
  userProfileImage: string;
  emailAddress: string;
  phoneNumber: string;
  location: { latitude: number; longitude: number; country?: string } | null;
  isActiveListening: boolean;
  activeSubscription: boolean;
  renewalDate: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: any | null;
  firebaseProfile: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, phoneNumber: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateListeningStatus: (isListening: boolean) => Promise<void>;
  updateUserLocation: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [firebaseProfile, setFirebaseProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { successToast, errorToast } = useToast();

  // Get user's current location
  const getUserLocation = async (): Promise<{ latitude: number; longitude: number; country?: string } | null> => {
    try {
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser');
        return null;
      }

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Try to get country from coordinates using reverse geocoding
            try {
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
              );
              const data = await response.json();
              
              let country = undefined;
              if (data.results && data.results[0]) {
                const addressComponents = data.results[0].address_components;
                const countryComponent = addressComponents.find(
                  (component: any) => component.types.includes('country')
                );
                if (countryComponent) {
                  country = countryComponent.long_name;
                }
              }
              
              resolve({ latitude, longitude, country });
            } catch (error) {
              console.error('Error getting country from coordinates:', error);
              resolve({ latitude, longitude });
            }
          },
          (error) => {
            console.error('Error getting location:', error);
            resolve(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      });
    } catch (error) {
      console.error('Error in getUserLocation:', error);
      return null;
    }
  };

  // Update user's listening status
  const handleUpdateListeningStatus = async (isListening: boolean) => {
    if (!user) return;
    
    try {
      const success = await updateListeningStatus(user.userID, isListening);
      if (success) {
        setUser(prev => prev ? { ...prev, isActiveListening: isListening } : null);
      }
    } catch (error) {
      console.error('Error updating listening status:', error);
    }
  };

  // Update user's location
  const handleUpdateLocation = async () => {
    if (!user) return;
    
    try {
      const location = await getUserLocation();
      if (location) {
        const success = await updateUserLocation(user.userID, location);
        if (success) {
          setUser(prev => prev ? { ...prev, location } : null);
        }
      }
    } catch (error) {
      console.error('Error updating user location:', error);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (!user) return;
    
    try {
      const updatedProfile = await getUserProfile(user.userID);
      if (updatedProfile) {
        setUser(updatedProfile);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Check for redirect result first
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('[AuthContext] Redirect result found:', result);
          const userProfile = await createUserProfile(result.user);
          if (userProfile.success && userProfile.profile) {
            setUser(userProfile.profile);
            setFirebaseUser(result.user);
            setFirebaseProfile(userProfile.profile);
            localStorage.setItem('isLoggedIn', 'true');
          }
        }

        // Set up Firebase auth state listener
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          console.log('[AuthContext] onAuthStateChanged fired. User:', firebaseUser);
          
          if (firebaseUser) {
            console.log('[AuthContext] User authenticated:', {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              emailVerified: firebaseUser.emailVerified,
              providerId: firebaseUser.providerData[0]?.providerId
            });
            
            setFirebaseUser(firebaseUser);
            localStorage.setItem('isLoggedIn', 'true');
            
            // Try to get existing profile or create new one
            let userProfile = await getUserProfile(firebaseUser.uid);
            
            if (!userProfile) {
              // Create new profile
              const createResult = await createUserProfile(firebaseUser);
              if (createResult.success && createResult.profile) {
                userProfile = createResult.profile;
              }
            } else {
              // Update last login for existing user
              await updateUserLastLogin(firebaseUser.uid);
              userProfile.lastLogin = new Date().toISOString();
            }
            
            if (userProfile) {
              setUser(userProfile);
              setFirebaseProfile(userProfile);
              
              // Update location if not set
              if (!userProfile.location) {
                handleUpdateLocation();
              }
            }
          } else {
            console.log('[AuthContext] No user authenticated, clearing state');
            setFirebaseUser(null);
            setFirebaseProfile(null);
            setUser(null);
            localStorage.removeItem('isLoggedIn');
          }
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('[AuthContext] Error in checkAuthState:', error);
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = async (email: string, password: string) => {
    // Implementation for email/password login
    throw new Error('Email/password login not implemented');
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, phoneNumber: string) => {
    // Implementation for email/password registration
    throw new Error('Email/password registration not implemented');
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithGoogle();
      
      // The onAuthStateChanged listener will handle the user state update
      // But we can also manually refresh the user data
      if (result.user) {
        await refreshUser();
      }
      
      successToast({
        title: "Success",
        description: "Successfully signed in with Google!",
      });
    } catch (error) {
      console.error('Error signing in with Google:', error);
      errorToast({
        title: "Sign In Failed",
        description: "Failed to sign in with Google. Please try again.",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
      setFirebaseProfile(null);
      localStorage.removeItem('isLoggedIn');
      successToast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Error logging out:', error);
      errorToast({
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
      });
    }
  };

  const value = {
    user,
    firebaseUser,
    firebaseProfile,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    signInWithGoogle,
    logout,
    updateListeningStatus: handleUpdateListeningStatus,
    updateUserLocation: handleUpdateLocation,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
