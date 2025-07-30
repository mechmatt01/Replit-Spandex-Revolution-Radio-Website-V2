import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { auth, handleRedirectResult, signInWithGoogle, createUserProfile, getUserProfile, updateUserProfile, uploadProfileImage, updateListeningStatus, updateUserLocation, loginUser, registerUser } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { XSSProtection } from "../../security/xss-protection";

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

  // Refresh user from Firebase only
  const refreshUser = async () => {
    try {
      // Use Firebase auth state instead of server API
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser({
          id: currentUser.uid,
          email: currentUser.email || '',
          username: currentUser.displayName || '',
          firstName: currentUser.displayName?.split(' ')[0] || '',
          lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
          phoneNumber: currentUser.phoneNumber || '',
          isEmailVerified: currentUser.emailVerified,
          isPhoneVerified: !!currentUser.phoneNumber,
          createdAt: currentUser.metadata.creationTime || new Date().toISOString(),
          updatedAt: currentUser.metadata.lastSignInTime || new Date().toISOString(),
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Attempting email/password login...');
      const result = await loginUser(email, password);

      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }

      console.log('[AuthContext] Login successful:', result.userID);

      // Store user data in localStorage
      localStorage.setItem('userID', result.userID);
      localStorage.setItem('userProfile', JSON.stringify(result.profile));
      localStorage.setItem('isLoggedIn', 'true');

      // Set user state
      setUser({
        id: result.userID,
        email: result.profile.EmailAddress,
        username: `${result.profile.FirstName} ${result.profile.LastName}`.trim(),
        firstName: result.profile.FirstName,
        lastName: result.profile.LastName,
        phoneNumber: result.profile.PhoneNumber,
        isEmailVerified: true,
        isPhoneVerified: !!result.profile.PhoneNumber,
        createdAt: result.profile.CreatedAt || new Date().toISOString(),
        updatedAt: result.profile.UpdatedAt || new Date().toISOString(),
      });

      setFirebaseProfile(result.profile);

      console.log('[AuthContext] Login completed, user state updated');
    } catch (error: any) {
      console.error('[AuthContext] Login error:', error);
      throw new Error(error.message || "Login failed");
    }
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
    try {
      console.log('[AuthContext] Attempting email/password registration...');
      const result = await registerUser({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
      });

      if (!result.success) {
        throw new Error(result.error || "Registration failed");
      }

      console.log('[AuthContext] Registration successful:', result.userID);

      // Store user data in localStorage
      localStorage.setItem('userID', result.userID);
      localStorage.setItem('userProfile', JSON.stringify(result.profile));
      localStorage.setItem('isLoggedIn', 'true');

      // Set user state
      setUser({
        id: result.userID,
        email: result.profile.EmailAddress,
        username: `${result.profile.FirstName} ${result.profile.LastName}`.trim(),
        firstName: result.profile.FirstName,
        lastName: result.profile.LastName,
        phoneNumber: result.profile.PhoneNumber,
        isEmailVerified: true,
        isPhoneVerified: !!result.profile.PhoneNumber,
        createdAt: result.profile.CreatedAt || new Date().toISOString(),
        updatedAt: result.profile.UpdatedAt || new Date().toISOString(),
      });

      setFirebaseProfile(result.profile);

      console.log('[AuthContext] Registration completed, user state updated');
    } catch (error: any) {
      console.error('[AuthContext] Registration error:', error);
      throw new Error(error.message || "Registration failed");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
      setFirebaseProfile(null);

      // Clear localStorage
      localStorage.removeItem('userID');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('isLoggedIn');
    } catch (error) {
      console.error('Logout error:', error);
    }
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
        setUser({
          id: userID,
          email: profile.EmailAddress,
          username: `${profile.FirstName} ${profile.LastName}`.trim(),
          firstName: profile.FirstName,
          lastName: profile.LastName,
          phoneNumber: profile.PhoneNumber,
          isEmailVerified: true,
          isPhoneVerified: !!profile.PhoneNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setFirebaseProfile(profile);
        console.log('[AuthContext] Restored user from localStorage:', profile);
      } catch (error) {
        console.error('[AuthContext] Error parsing stored profile:', error);
        // Clear invalid data
        localStorage.removeItem('userID');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('isLoggedIn');
      }
    }

    // Set up Firebase auth state listener for Google OAuth
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[AuthContext] onAuthStateChanged fired. User:', user);
      if (user) {
        console.log('[AuthContext] User authenticated via Google:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          providerId: user.providerData[0]?.providerId
        });

        setFirebaseUser(user);
        localStorage.setItem('isLoggedIn', 'true');

        // Set the user state for the app
        setUser({
          id: user.uid,
          email: user.email || '',
          username: user.displayName || '',
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          phoneNumber: user.phoneNumber || '',
          isEmailVerified: user.emailVerified,
          isPhoneVerified: !!user.phoneNumber,
          createdAt: user.metadata.creationTime || new Date().toISOString(),
          updatedAt: user.metadata.lastSignInTime || new Date().toISOString(),
        });

        try {
          const profileResult = await createUserProfile(user);
          console.log('[AuthContext] Profile creation result:', profileResult);
          if (profileResult.success) {
            setFirebaseProfile(profileResult.profile);
            console.log('[AuthContext] Firebase profile set:', profileResult.profile);
          }
        } catch (error) {
          console.error('[AuthContext] Error creating/loading profile:', error);
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

    // Handle redirect result from Google sign in
    console.log('[AuthContext] Checking for redirect result...');
    handleRedirectResult().then((result) => {
      console.log('[AuthContext] handleRedirectResult result:', result);
      if (result.success && result.user) {
        console.log('[AuthContext] Successful redirect result, setting user state');
        setFirebaseUser(result.user);
        setUser({
          id: result.user.uid,
          email: result.user.email || '',
          username: result.user.displayName || '',
          firstName: result.user.displayName?.split(' ')[0] || '',
          lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
          phoneNumber: result.user.phoneNumber || '',
          isEmailVerified: result.user.emailVerified,
          isPhoneVerified: !!result.user.phoneNumber,
          createdAt: result.user.metadata.creationTime || new Date().toISOString(),
          updatedAt: result.user.metadata.lastSignInTime || new Date().toISOString(),
        });
        if (result.profileResult?.profile) {
          setFirebaseProfile(result.profileResult.profile);
        }
        setLoading(false);
        localStorage.setItem('isLoggedIn', 'true');
        console.log('[AuthContext] User state set after Google redirect:', result.user);
      } else {
        console.log('[AuthContext] No successful redirect result, error:', result.error);
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