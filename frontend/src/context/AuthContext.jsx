import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('bagfit_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hydrate user on mount if token exists
  useEffect(() => {
    async function hydrateUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.getMe();
        setUser(response.user);
      } catch (err) {
        console.error('Failed to hydrate user:', err);
        // Clear invalid token
        localStorage.removeItem('bagfit_token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    hydrateUser();
  }, [token]);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await apiClient.login(email, password);
      apiClient.setToken(response.token);
      setToken(response.token);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const register = useCallback(async (data) => {
    setError(null);
    try {
      const response = await apiClient.register(data);
      apiClient.setToken(response.token);
      setToken(response.token);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    apiClient.setToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (profile) => {
    try {
      const response = await apiClient.updateProfile(profile);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateProfile,
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
