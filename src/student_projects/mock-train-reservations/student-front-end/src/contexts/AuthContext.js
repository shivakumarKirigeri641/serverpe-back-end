import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // No automatic session check - user starts fresh each time
  const checkAuth = useCallback(async () => {
    // Not used on mount - session is not restored
  }, []);

  // Send OTP
  const sendOtp = async (email) => {
    const response = await authApi.sendOtp(email);
    return response;
  };

  // Verify OTP and login
  const verifyOtp = async (email, otp) => {
    const response = await authApi.verifyOtp(email, otp);
    if (response.data?.verified) {
      setUser({ email });
      setIsAuthenticated(true);
    }
    return response;
  };

  // Logout
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    sendOtp,
    verifyOtp,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
