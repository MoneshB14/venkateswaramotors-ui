import { createContext, useContext, useState, useEffect } from 'react';
import { vmServiceAuth } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on app load
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await vmServiceAuth.checkAuthStatus();

      if (response.success) {
        // User is authenticated, set user data
        setUser({
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
        });
      } else {
        // User is not authenticated
        setUser(null);
      }
    } catch (err) {
      console.error('Auth status check failed:', err);
      // If there's an error (like network issue), don't clear user immediately
      // Only clear if it's a 401 unauthorized error
      if (err.response?.status === 401) {
        setUser(null);
      }
      setError(err.message || 'Failed to check authentication status');
    } finally {
      setLoading(false);
    }
  };

  // Check auth status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, otp) => {
    try {
      setLoading(true);
      setError(null);

      const response = await vmServiceAuth.verifyOtp(email, otp);

      if (response.success) {
        // Set user data from login response
        setUser({
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
        });
        return { success: true };
      } else {
        setError(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      // Clear user data
      setUser(null);
      setError(null);

      // You can add a logout API call here if needed
      // await vmServiceAuth.logout();

      // Redirect to login page
      window.location.href = '/service/login';
    } catch (err) {
      console.error('Logout failed:', err);
      // Even if logout API fails, clear local state
      setUser(null);
      window.location.href = '/service/login';
    } finally {
      setLoading(false);
    }
  };

  // Send OTP function
  const sendOtp = async (email) => {
    try {
      setLoading(true);
      setError(null);

      const response = await vmServiceAuth.login(email);

      if (response.success) {
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Failed to send OTP');
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error('Send OTP failed:', err);
      setError(err.response?.data?.message || 'Failed to send OTP');
      return { success: false, message: err.response?.data?.message || 'Failed to send OTP' };
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP function
  const resendOtp = async (email) => {
    try {
      setLoading(true);
      setError(null);

      const response = await vmServiceAuth.resendOtp(email);

      if (response.success) {
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Failed to resend OTP');
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error('Resend OTP failed:', err);
      setError(err.response?.data?.message || 'Failed to resend OTP');
      return { success: false, message: err.response?.data?.message || 'Failed to resend OTP' };
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      setLoading(true);

      // Clear any previous errors when starting a new signup attempt
      setError(null);

      const response = await vmServiceAuth.signup(userData);

      if (response.success) {
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Signup failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error('Signup failed:', err);

      // Handle specific error cases
      let errorMessage = 'Signup failed';

      // Use the enhanced error message from the interceptor if available
      if (err.userMessage) {
        errorMessage = err.userMessage;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Check for specific error patterns and provide user-friendly messages
      if (errorMessage.toLowerCase().includes('already exists')) {
        errorMessage = 'An account with this email address already exists. Please use a different email or try logging in instead.';
      } else if (errorMessage.toLowerCase().includes('email')) {
        errorMessage = 'Please check your email address and try again.';
      } else if (errorMessage.toLowerCase().includes('validation')) {
        errorMessage = 'Please check your input and try again.';
      }

      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Refresh auth status (can be called manually if needed)
  const refreshAuth = () => {
    checkAuthStatus();
  };

  // Clear error manually
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    sendOtp,
    resendOtp,
    signup,
    refreshAuth,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 