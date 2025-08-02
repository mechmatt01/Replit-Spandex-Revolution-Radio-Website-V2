import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { auth, handleRedirectResult, signInWithGoogle, createUserProfile, getUserProfile, updateUserProfile, uploadProfileImage, updateListeningStatus, updateUserLocation, loginUser, registerUser } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

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
  LastActive?: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: any | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load user profile from Firebase
  const loadUserProfile = async (userID: string) => {
    try {
      const result = await getUserProfile(userID);
      if (result.success && result.profile) {
        setUser(result.profile);
        return result.profile;
      }
      return null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Attempting email/password login...');
      const result = await loginUser(email, password);
      
      if (!result.success) {
        toast({
          title: "Login Failed",
          description: result.error || "Invalid email or password",
          variant: "error",
        });
        throw new Error(result.error || "Login failed");
      }
      
      console.log('[AuthContext] Login successful:', result.userID);
      
      // Store user data in localStorage
      localStorage.setItem('userID', result.userID);
      localStorage.setItem('userProfile', JSON.stringify(result.profile));
      localStorage.setItem('isLoggedIn', 'true');
      
      // Set user state
      setUser(result.profile);
      
      // Update location if available
      try {
        await updateUserLocation(result.userID);
        toast({
          title: "Location Updated",
          description: "Your location has been updated",
          variant: "default",
        });
      } catch (error) {
        console.log('Location not available or update failed');
      }
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${result.profile.FirstName}!`,
        variant: "default",
      });
      
      console.log('[AuthContext] Login completed, user state updated');
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      throw error;
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    password: string,
  ) => {
    try {
      console.log('[AuthContext] Attempting registration...');
      const result = await registerUser({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
      });
      
      if (!result.success) {
        toast({
          title: "Registration Failed",
          description: result.error || "Registration failed",
          variant: "error",
        });
        throw new Error(result.error || "Registration failed");
      }
      
      console.log('[AuthContext] Registration successful:', result.userID);
      
      // Store user data in localStorage
      localStorage.setItem('userID', result.userID);
      localStorage.setItem('userProfile', JSON.stringify(result.profile));
      localStorage.setItem('isLoggedIn', 'true');
      
      // Set user state
      setUser(result.profile);
      
      // Update location if available
      try {
        await updateUserLocation(result.userID);
        toast({
          title: "Location Updated",
          description: "Your location has been updated",
          variant: "default",
        });
      } catch (error) {
        console.log('Location not available or update failed');
      }
      
      toast({
        title: "Registration Successful",
        description: `Welcome to Spandex Salvation Radio, ${firstName}!`,
        variant: "default",
      });
      
      console.log('[AuthContext] Registration completed, user state updated');
    } catch (error) {
      console.error('[AuthContext] Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Logging out...');
      
      // Update listening status to false before logout
      if (user?.UserID) {
        await updateListeningStatus(user.UserID, false);
      }
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear local state
      setUser(null);
      setFirebaseUser(null);
      
      // Clear localStorage
      localStorage.removeItem('userID');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('isLoggedIn');
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
        variant: "default",
      });
      
      console.log('[AuthContext] Logout completed');
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      toast({
        title: "Logout Error",
        description: "An error occurred during logout",
        variant: "error",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('[AuthContext] Initiating Google sign-in...');
      await signInWithGoogle();
    } catch (error: any) {
      console.error('[AuthContext] Google sign-in error:', error);
      toast({
        title: "Google Sign-In Failed",
        description: error.message || "Failed to sign in with Google",
        variant: "error",
      });
      throw error;
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      if (user?.UserID) {
        const result = await updateUserProfile(user.UserID, updates);
        if (result.success) {
          // Reload the profile to reflect changes
          await loadUserProfile(user.UserID);
          toast({
            title: "Profile Updated",
            description: "Your profile has been updated successfully",
            variant: "default",
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile",
        variant: "error",
      });
      return false;
    }
  };

  const handleUploadProfileImage = async (file: File) => {
    try {
      if (user?.UserID) {
        const result = await uploadProfileImage(user.UserID, file);
        if (result.success) {
          // Reload the profile to reflect changes
          await loadUserProfile(user.UserID);
          toast({
            title: "Image Uploaded",
            description: "Profile image updated successfully",
            variant: "default",
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile image",
        variant: "error",
      });
      return false;
    }
  };

  // Update listening status
  const handleUpdateListeningStatus = async (isListening: boolean) => {
    try {
      if (user?.UserID) {
        await updateListeningStatus(user.UserID, isListening);
        // Update local state
        setUser(prev => prev ? { ...prev, IsActiveListening: isListening } : null);
        
        toast({
          title: isListening ? "Now Playing" : "Playback Stopped",
          description: isListening ? "You're now listening to Spandex Salvation Radio" : "Playback has been stopped",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error updating listening status:', error);
      toast({
        title: "Status Update Failed",
        description: "Failed to update listening status",
        variant: "error",
      });
    }
  };

  // Update location
  const handleUpdateLocation = async () => {
    try {
      if (user?.UserID) {
        const result = await updateUserLocation(user.UserID);
        if (result.success) {
          // Reload the profile to reflect changes
          await loadUserProfile(user.UserID);
          toast({
            title: "Location Updated",
            description: "Your location has been updated",
            variant: "default",
          });
        } else {
          toast({
            title: "Location Unavailable",
            description: "Unable to get your location. Please check your browser settings.",
            variant: "error",
          });
        }
      }
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Location Update Failed",
        description: "Failed to update location",
        variant: "error",
      });
    }
  };

  useEffect(() => {
    console.log('[AuthContext] Setting up authentication listeners...');
    
    // Restore login state from localStorage
    const wasLoggedIn = localStorage.getItem('isLoggedIn');
    const userID = localStorage.getItem('userID');
    const userProfile = localStorage.getItem('userProfile');
    
    console.log('[AuthContext] Previous login state:', wasLoggedIn);
    console.log('[AuthContext] Stored userID:', userID);
    console.log('[AuthContext] Stored userProfile:', userProfile);
    
    if (wasLoggedIn === 'true' && userID && userProfile) {
      try {
        const profile = JSON.parse(userProfile);
        setUser(profile);
        console.log('[AuthContext] Restored user from localStorage:', profile);
        
        // Update location if available
        updateUserLocation(userID).catch(() => {
          console.log('Location not available for restored user');
        });
      } catch (error) {
        console.error('[AuthContext] Error parsing stored profile:', error);
        // Clear invalid data
        localStorage.removeItem('userID');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('isLoggedIn');
      }
    }

    // Set up Firebase auth state listener for Google OAuth
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AuthContext] onAuthStateChanged fired. User:', firebaseUser);
      if (firebaseUser) {
        console.log('[AuthContext] User authenticated via Google:', {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
          providerId: firebaseUser.providerData[0]?.providerId
        });
        
        setFirebaseUser(firebaseUser);
        localStorage.setItem('isLoggedIn', 'true');
        
        try {
          // Create or get user profile
          const profileResult = await createUserProfile(firebaseUser);
          console.log('[AuthContext] Profile creation result:', profileResult);
          if (profileResult.success && profileResult.profile) {
            setUser(profileResult.profile);
            localStorage.setItem('userID', profileResult.userID);
            localStorage.setItem('userProfile', JSON.stringify(profileResult.profile));
            console.log('[AuthContext] Firebase profile set:', profileResult.profile);
            
            toast({
              title: "Welcome Back!",
              description: `Welcome to Spandex Salvation Radio, ${profileResult.profile.FirstName}!`,
              variant: "default",
            });
          }
        } catch (error) {
          console.error('[AuthContext] Error creating/loading profile:', error);
          toast({
            title: "Profile Error",
            description: "Failed to load user profile",
            variant: "error",
          });
        }
      } else {
        console.log('[AuthContext] No user authenticated, clearing state');
        setFirebaseUser(null);
        setUser(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userID');
        localStorage.removeItem('userProfile');
      }
      setLoading(false);
    });

    // Handle redirect result from Google sign in
    console.log('[AuthContext] Checking for redirect result...');
    handleRedirectResult().then((result) => {
      console.log('[AuthContext] handleRedirectResult result:', result);
      if (result.success && result.user) {
        console.log('[AuthContext] Successful redirect result, setting user state');
        setFirebaseUser(result.user);
        if (result.profileResult?.profile) {
          setUser(result.profileResult.profile);
          localStorage.setItem('userID', result.profileResult.userID);
          localStorage.setItem('userProfile', JSON.stringify(result.profileResult.profile));
          localStorage.setItem('isLoggedIn', 'true');
          
          toast({
            title: "Google Sign-In Successful",
            description: `Welcome to Spandex Salvation Radio, ${result.profileResult.profile.FirstName}!`,
            variant: "default",
          });
        }
        setLoading(false);
        console.log('[AuthContext] User state set after Google redirect:', result.user);
      } else {
        console.log('[AuthContext] No successful redirect result, error:', result.error);
        if (result.error) {
          toast({
            title: "Google Sign-In Failed",
            description: result.error,
            variant: "error",
          });
        }
      }
    });

    setLoading(false);

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isAuthenticated: !!user || !!firebaseUser,
        login,
        register,
        logout,
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
