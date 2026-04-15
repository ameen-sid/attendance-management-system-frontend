import React, { useState, useEffect } from 'react';
import { loginWeb as loginApi, logout as logoutApi } from '../services/auth.service';
import type { LoginCredentials } from '../services/auth.service';
import type { User } from '../types';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {

        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user_data');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: LoginCredentials) => {

        const response = await loginApi(credentials);
        const { token, user } = response.data.data;

        setToken(token);
        setUser(user);

        localStorage.setItem('access_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
    };

    const logout = async () => {

        setIsLoading(true);
        try {
            try { await logoutApi(); } catch { /* ignore network error on logout */ }

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