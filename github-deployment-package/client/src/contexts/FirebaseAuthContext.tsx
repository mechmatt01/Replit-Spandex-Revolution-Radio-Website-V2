import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FirebaseUser {
  userID: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileImage: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  activeSubscription: boolean;
  isActiveListening: boolean;
  renewalDate?: Date;
  createdAt: Date;
  lastLoginAt?: Date;
}

interface FirebaseAuthContextType {
  user: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    password: string;
  }) => Promise<{ success: boolean; message: string; userKey?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (data: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<{
    firstName: string;
    lastName: string;
    phoneNumber: string;
    location: { lat: number; lng: number; address?: string };
    isActiveListening: boolean;
    activeSubscription: boolean;
  }>) => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}

interface FirebaseAuthProviderProps {
  children: ReactNode;
}

export function FirebaseAuthProvider({ children }: FirebaseAuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/firebase/user', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    password: string;
  }) => {
    try {
      const response = await fetch('/api/auth/firebase/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, message: result.message, userKey: result.userKey };
      } else {
        return { success: false, message: result.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed due to network error' };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/firebase/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed due to network error' };
    }
  };

  const loginWithGoogle = async (data: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      const response = await fetch('/api/auth/firebase/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message || 'Google authentication failed' };
      }
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, message: 'Google authentication failed due to network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/firebase/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (data: Partial<{
    firstName: string;
    lastName: string;
    phoneNumber: string;
    location: { lat: number; lng: number; address?: string };
    isActiveListening: boolean;
    activeSubscription: boolean;
  }>) => {
    try {
      const response = await fetch('/api/auth/firebase/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Refresh user data after successful update
        await refreshUser();
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message || 'Profile update failed' };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: 'Profile update failed due to network error' };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/firebase/user', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('User refresh failed:', error);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    register,
    login,
    loginWithGoogle,
    logout,
    updateProfile,
    refreshUser,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}