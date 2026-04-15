import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginWeb as loginApi, logout as logoutApi } from '../services/auth.service';

interface AuthContextType {
    user: any;
    token: string | null;
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check local storage on load
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user_data');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: any) => {
        // Don't set global isLoading here, as it causes the App to unmount the Login component
        // The Login page handles its own local loading state
        try {
            const response = await loginApi(credentials);

            // Backend returns: { statusCode, data: { token, user }, message, success }
            const { token, user } = response.data.data;

            setToken(token);
            setUser(user);

            localStorage.setItem('access_token', token);
            localStorage.setItem('user_data', JSON.stringify(user));
        } catch (error) {
            // Re-throw the error so Login page can catch it
            throw error;
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            // Optional: Call API to invalidate token on server
            try { await logoutApi(); } catch (e) { /* ignore network error on logout */ }

            setToken(null);
            setUser(null);
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_data');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            isLoading,
            isAuthenticated: !!token
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
