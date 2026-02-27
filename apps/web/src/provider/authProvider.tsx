import axios from "axios";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import type { ReactNode } from "react";

axios.defaults.withCredentials = true;

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axios.get("/api/auth/me")
            .then(() => setIsAuthenticated(true))
            .catch(() => setIsAuthenticated(false))
            .finally(() => setIsLoading(false));
    }, []);

    const login = useCallback(() => setIsAuthenticated(true), []);

    const logout = useCallback(() => {
        axios.post("/api/auth/logout")
            .catch(() => {})
            .finally(() => setIsAuthenticated(false));
    }, []);

    const contextValue = useMemo(
        () => ({ isAuthenticated, isLoading, login, logout }),
        [isAuthenticated, isLoading, login, logout],
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};

export default AuthProvider;