import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  PhoneAuthProvider,
  linkWithCredential,
} from "firebase/auth";
import { 
  auth, 
  googleProvider, 
  UserProfile,
  createUserProfile,
  getUserProfileByAuthUID,
  updateUserProfile,
  updateListeningStatus,
  updateUserLocation,
  uploadProfileImage,
  generateUserID
} from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profileData: {
    FirstName: string;
    LastName: string;
    PhoneNumber: string;
  }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  verifyPhoneNumber: (phoneNumber: string) => Promise<ConfirmationResult>;
  confirmPhoneVerification: (verificationCode: string, confirmationResult: ConfirmationResult) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setListeningStatus: (isListening: boolean) => Promise<void>;
  updateLocationIfNeeded: () => Promise<void>;
  uploadUserProfileImage: (file: File) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useFirebaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useFirebaseAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // Firebase not initialized, set loading to false
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Load user profile from Firestore
          const profiles = await getUserProfileByAuthUID(user.uid);
          if (profiles) {
            setUserProfile(profiles);
            // Update location if needed
            await updateUserLocation(profiles.UserID);
          }
        } catch (error) {
          console.warn('Firebase user profile loading failed:', error);
          // Continue without profile data
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase auth not initialized");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, profileData: {
    FirstName: string;
    LastName: string;
    PhoneNumber: string;
  }) => {
    if (!auth) throw new Error("Firebase auth not initialized");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      try {
        const profile = await createUserProfile(userCredential.user, profileData);
        setUserProfile(profile);
      } catch (profileError) {
        console.warn('Profile creation failed:', profileError);
        // Continue without profile
      }
      
      // Send email verification
      try {
        await sendEmailVerification(userCredential.user);
      } catch (emailError) {
        console.warn('Email verification failed:', emailError);
        // Continue without email verification
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) throw new Error("Firebase auth or Google provider not initialized");
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      
      // Check if user profile exists, if not create one
      try {
        const existingProfile = await getUserProfileByAuthUID(userCredential.user.uid);
        if (!existingProfile) {
          const profile = await createUserProfile(userCredential.user, {
            FirstName: userCredential.user.displayName?.split(' ')[0] || '',
            LastName: userCredential.user.displayName?.split(' ').slice(1).join(' ') || '',
            PhoneNumber: '',
          });
          setUserProfile(profile);
        }
      } catch (profileError) {
        console.warn('Profile handling failed:', profileError);
        // Continue without profile
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      if (userProfile) {
        await updateListeningStatus(userProfile.UserID, false);
      }
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if status update fails
      setUserProfile(null);
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error("Firebase auth not initialized");
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const sendEmailVerificationToUser = async () => {
    if (!auth || !auth.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (error) {
      console.error('Email verification error:', error);
    }
  };

  const verifyPhoneNumber = async (phoneNumber: string): Promise<ConfirmationResult> => {
    if (!auth || !auth.currentUser) throw new Error("User not authenticated");
    
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber
        }
      });
      
      return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    } catch (error) {
      console.error('Phone verification error:', error);
      throw error;
    }
  };

  const confirmPhoneVerification = async (verificationCode: string, confirmationResult: ConfirmationResult) => {
    if (!auth || !auth.currentUser || !userProfile) return;
    
    try {
      const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, verificationCode);
      await linkWithCredential(auth.currentUser, credential);
      
      // Update user profile with phone verified status
      await updateUserProfile(userProfile.UserID, { PhoneVerified: true });
      setUserProfile(prev => prev ? { ...prev, PhoneVerified: true } : null);
    } catch (error) {
      console.error('Phone confirmation error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    
    try {
      await updateUserProfile(userProfile.UserID, updates);
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const setListeningStatus = async (isListening: boolean) => {
    if (!userProfile) return;
    
    try {
      await updateListeningStatus(userProfile.UserID, isListening);
      setUserProfile(prev => prev ? { ...prev, IsActiveListening: isListening } : null);
    } catch (error) {
      console.error('Listening status update error:', error);
    }
  };

  const updateLocationIfNeeded = async () => {
    if (!userProfile) return;
    
    try {
      await updateUserLocation(userProfile.UserID);
    } catch (error) {
      console.error('Location update error:', error);
    }
  };

  const uploadUserProfileImage = async (file: File): Promise<string> => {
    if (!userProfile) throw new Error("User profile not found");
    
    try {
      const imageUrl = await uploadProfileImage(userProfile.UserID, file);
      await updateProfile({ UserProfileImage: imageUrl });
      return imageUrl;
    } catch (error) {
      console.error('Profile image upload error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    sendEmailVerification: sendEmailVerificationToUser,
    verifyPhoneNumber,
    confirmPhoneVerification,
    updateProfile,
    setListeningStatus,
    updateLocationIfNeeded,
    uploadUserProfileImage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}