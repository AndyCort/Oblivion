import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
    token: string | null;
    isAdmin: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Initialization: Check if token exists in local storage
        const storedToken = localStorage.getItem('oblivion_token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const loginContext = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem('oblivion_token', newToken);
    };

    const logoutContext = () => {
        setToken(null);
        localStorage.removeItem('oblivion_token');
    };

    return (
        <AuthContext.Provider value={{ token, isAdmin: !!token, login: loginContext, logout: logoutContext }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
