/**
 * ============================================================================
 * AUTH CONTEXT - Authentication State Management
 * ============================================================================
 * 
 * Manages user authentication state using email + OTP login.
 * 
 * ============================================================================
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { sendOtp, verifyOtp } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('mockTrain_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading user session:', error);
      localStorage.removeItem('mockTrain_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request OTP
  const requestOtp = async (email) => {
    try {
      const result = await sendOtp(email);
      toast.success('OTP sent to your email!');
      return { success: true, message: result.message };
    } catch (error) {
      toast.error(error.userMessage || 'Failed to send OTP');
      return { success: false, error };
    }
  };

  // Verify OTP and Login
  const login = async (email, otp) => {
    try {
      const result = await verifyOtp(email, otp);
      
      const userData = {
        email: email,
        loginTime: new Date().toISOString(),
      };

      // Save to localStorage
      localStorage.setItem('mockTrain_user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      toast.success('Login successful! Welcome aboard! 🚂');
      return { success: true };
    } catch (error) {
      toast.error(error.userMessage || 'Invalid OTP');
      return { success: false, error };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('mockTrain_user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    requestOtp,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
