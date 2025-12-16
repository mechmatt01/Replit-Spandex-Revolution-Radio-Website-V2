/* PHASE 7: Band Submissions Logic */
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Mock User Data - In production, this comes from your DB/Auth provider
  const [user, setUser] = useState({
    name: "Matt",
    isLoggedIn: true,
    isBandMember: true, // Toggles the submission form visibility
  });

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);