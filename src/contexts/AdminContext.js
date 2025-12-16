import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
const AdminContext = createContext(undefined);
export function AdminProvider({ children }) {
    const [user, setUser] = useState(null);
    const [useMockData, setUseMockData] = useState(false);
    const [useLiveData, setUseLiveData] = useState(true);
    // Ensure only one mode is active at a time
    const handleMockDataChange = (useMock) => {
        setUseMockData(useMock);
        if (useMock) {
            setUseLiveData(false);
        }
    };
    const handleLiveDataChange = (useLive) => {
        setUseLiveData(useLive);
        if (useLive) {
            setUseMockData(false);
        }
    };
    const login = async (username, password) => {
        // Mock login for now - replace with real authentication
        if (username === "admin" && password === "password") {
            setUser({
                userID: "admin-1",
                firstName: "Admin",
                lastName: "User",
                emailAddress: "admin@example.com",
                isAdmin: true,
            });
            return true;
        }
        return false;
    };
    const logout = () => {
        setUser(null);
    };
    return (_jsx(AdminContext.Provider, { value: {
            user,
            isAdmin: !!user?.isAdmin,
            useMockData,
            setUseMockData: handleMockDataChange,
            useLiveData,
            setUseLiveData: handleLiveDataChange,
            login,
            logout,
        }, children: children }));
}
export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
}
