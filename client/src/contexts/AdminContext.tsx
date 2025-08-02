import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
  isLiveDataEnabled: boolean;
  setIsLiveDataEnabled: (enabled: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLiveDataEnabled, setIsLiveDataEnabled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load admin state from localStorage on mount
  useEffect(() => {
    const savedAdminState = localStorage.getItem('isAdmin');
    const savedLiveDataState = localStorage.getItem('isLiveDataEnabled');
    
    if (savedAdminState === 'true') {
      setIsAdmin(true);
    }
    
    if (savedLiveDataState === 'true') {
      setIsLiveDataEnabled(true);
    }
  }, []);

  // Save admin state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('isAdmin', isAdmin.toString());
  }, [isAdmin]);

  // Save live data state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('isLiveDataEnabled', isLiveDataEnabled.toString());
  }, [isLiveDataEnabled]);

  const value = {
    isLiveDataEnabled,
    setIsLiveDataEnabled,
    isAdmin,
    setIsAdmin,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};