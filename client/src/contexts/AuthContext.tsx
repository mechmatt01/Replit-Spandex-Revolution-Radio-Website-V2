import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { auth, handleRedirectResult, signInWithGoogle, createUserProfile, getUserProfile, updateUserProfile, uploadProfileImage, updateListeningStatus, updateUserLocation } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  firebaseUser: any | null;
  firebaseProfile: any | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    recaptchaToken?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateProfile: (updates: any) => Promise<boolean>;
  uploadProfileImage: (file: File) => Promise<boolean>;
  updateListeningStatus: (isListening: boolean) => Promise<void>;
  updateLocation: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

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

  // Handle Firebase user profile loading
  const loadFirebaseProfile = async (userId: string) => {
    try {
      const result = await getUserProfile(userId);
      if (result.success) {
        setFirebaseProfile(result.profile);
        return result.profile;
      }
      return null;
    } catch (error) {
      console.error('Error loading Firebase profile:', error);
      return null;
    }
  };

  // Refresh user from backend (existing functionality)
  const refreshUser = async () => {
    try {
      const response = await fetch("/api/auth/user", {
        credentials: "include",
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();
    setUser(data.user);
  };

  const register = async (
    email: string,
    password: string,
    username: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    recaptchaToken?: string,
  ) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
        username,
        firstName,
        lastName,
        phoneNumber,
        recaptchaToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    const data = await response.json();
    setUser(data.user);
  };

  const logout = async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setFirebaseUser(null);
    setFirebaseProfile(null);
  };

  // Firebase Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  // Update Firebase profile
  const updateProfile = async (updates: any) => {
    try {
      if (firebaseProfile?.UserID) {
        const result = await updateUserProfile(firebaseProfile.UserID, updates);
        if (result.success) {
          // Reload the profile to reflect changes
          await loadFirebaseProfile(firebaseProfile.UserID);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  // Upload profile image
  const handleUploadProfileImage = async (file: File) => {
    try {
      if (firebaseProfile?.UserID) {
        const result = await uploadProfileImage(firebaseProfile.UserID, file);
        if (result.success) {
          // Reload the profile to reflect changes
          await loadFirebaseProfile(firebaseProfile.UserID);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      return false;
    }
  };

  // Update listening status
  const handleUpdateListeningStatus = async (isListening: boolean) => {
    try {
      if (firebaseProfile?.UserID) {
        await updateListeningStatus(firebaseProfile.UserID, isListening);
      }
    } catch (error) {
      console.error('Error updating listening status:', error);
    }
  };

  // Update location
  const handleUpdateLocation = async () => {
    try {
      if (firebaseProfile?.UserID) {
        await updateUserLocation(firebaseProfile.UserID);
        // Reload the profile to reflect changes
        await loadFirebaseProfile(firebaseProfile.UserID);
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  useEffect(() => {
    refreshUser();

    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        console.log('Firebase user authenticated:', user);
        
        // Check if user profile exists, if not create it
        // For now, we'll use a simple approach - in production you'd want to check existing profiles
        try {
          const profileResult = await createUserProfile(user);
          if (profileResult.success) {
            setFirebaseProfile(profileResult.profile);
          }
        } catch (error) {
          console.error('Error creating/loading profile:', error);
        }
      } else {
        setFirebaseUser(null);
        setFirebaseProfile(null);
      }
      setLoading(false);
    });

    // Handle redirect result from Google sign in
    handleRedirectResult().then((result) => {
      if (result.success) {
        console.log('Google sign in redirect successful');
      }
    });

    // Set up auth state persistence
    const interval = setInterval(
      () => {
        // Refresh auth state every 5 minutes to ensure persistent login
        if (!loading) {
          refreshUser();
        }
      },
      5 * 60 * 1000,
    );

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        firebaseProfile,
        loading,
        isAuthenticated: !!user || !!firebaseUser,
        login,
        register,
        logout,
        refreshUser,
        signInWithGoogle: handleGoogleSignIn,
        updateProfile,
        uploadProfileImage: handleUploadProfileImage,
        updateListeningStatus: handleUpdateListeningStatus,
        updateLocation: handleUpdateLocation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
