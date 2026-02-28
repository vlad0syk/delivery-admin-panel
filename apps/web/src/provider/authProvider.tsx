import axios from "axios";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import type { ReactNode } from "react";

axios.defaults.withCredentials = true;

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    email: string | null;
    login: (email: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [email, setEmail] = useState<string | null>(null);

    const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';

    useEffect(() => {
        axios.get(`${API_BASE}/auth/me`)
            .then((res) => {
                setIsAuthenticated(true);
                setEmail(res.data?.email ?? null);
            })
            .catch(() => setIsAuthenticated(false))
            .finally(() => setIsLoading(false));
    }, []);

    const login = useCallback((userEmail: string) => {
        setIsAuthenticated(true);
        setEmail(userEmail);
    }, []);

    const logout = useCallback(() => {
        axios.post(`${API_BASE}/auth/logout`)
            .catch(() => { })
            .finally(() => {
                setIsAuthenticated(false);
                setEmail(null);
            });
    }, []);

    const contextValue = useMemo(
        () => ({ isAuthenticated, isLoading, email, login, logout }),
        [isAuthenticated, isLoading, email, login, logout],
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