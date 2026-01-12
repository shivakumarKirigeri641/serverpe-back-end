/**
 * Authentication Context
 * Manages user authentication state across the app
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { checkAuth, logout as apiLogout } from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication status on mount
    const checkAuthStatus = useCallback(async () => {
        try {
            const response = await checkAuth();
            if (response.success && response.data.authenticated) {
                setUser({ email: response.data.email });
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    // Login function
    const login = (email, token) => {
        setUser({ email });
        setIsAuthenticated(true);
        // Store token in localStorage as backup
        if (token) {
            localStorage.setItem('authToken', token);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('authToken');
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
