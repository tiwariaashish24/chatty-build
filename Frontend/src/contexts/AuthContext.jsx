import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await authService.checkAuth();
      setUser(data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      const data = await authService.signup(userData);
      setUser(data);
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
      return false;
    }
  };

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      setUser(data);
      toast.success('Logged in successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const updateProfile = async (profilePic) => {
    try {
      const data = await authService.updateProfile(profilePic);
      setUser(data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Profile update failed');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        updateProfile,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
