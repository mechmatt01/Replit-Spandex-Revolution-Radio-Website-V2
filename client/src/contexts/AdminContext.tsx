import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useFirebaseAuth } from "./FirebaseAuthContext";
import { findUserProfileByFirebaseUID } from "../lib/firebase";

interface AdminUser {
  userID: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  isAdmin: boolean;
}

interface AdminContextType {
  user: AdminUser | null;
  isAdmin: boolean;
  useMockData: boolean;
  setUseMockData: (useMock: boolean) => void;
  useLiveData: boolean;
  setUseLiveData: (useLive: boolean) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [useLiveData, setUseLiveData] = useState(true);

  // Ensure only one mode is active at a time
  const handleMockDataChange = (useMock: boolean) => {
    setUseMockData(useMock);
    if (useMock) {
      setUseLiveData(false);
    }
  };

  const handleLiveDataChange = (useLive: boolean) => {
    setUseLiveData(useLive);
    if (useLive) {
      setUseMockData(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUser({
          userID: "admin-1",
          firstName: "Admin",
          lastName: "User",
          emailAddress: "admin@example.com",
          isAdmin: true,
        });
        return true;
      } else {
        console.error('Admin login failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AdminContext.Provider
      value={{
        user,
        isAdmin: !!user?.isAdmin,
        useMockData,
        setUseMockData: handleMockDataChange,
        useLiveData,
        setUseLiveData: handleLiveDataChange,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
