import { createContext, useContext, useState } from "react";
const AdminContext = createContext(undefined);
export function AdminProvider({ children }) {
    const [user, setUser] = useState(null);
    const login = async (username, password) => {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error("Login error:", error);
            return false;
        }
    };
    const logout = () => {
        setUser(null);
    };
    return (<AdminContext.Provider value={{
            user,
            isAdmin: user?.isAdmin || false,
            login,
            logout,
        }}>
      {children}
    </AdminContext.Provider>);
}
export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
}
