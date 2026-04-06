import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cw_token'));
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem('cw_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      setToken(storedToken);
    } catch (err) {
      console.error('Failed to load user:', err);
      localStorage.removeItem('cw_token');
      localStorage.removeItem('cw_user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('cw_token', newToken);
    localStorage.setItem('cw_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    // Load full user profile
    try {
      const profileRes = await api.get('/auth/me');
      setUser(profileRes.data);
    } catch {
      // Use partial user data from login response
    }
    return res.data;
  };

  const register = async (name, email, password, collegeId) => {
    const res = await api.post('/auth/register', { name, email, password, collegeId });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('cw_token', newToken);
    localStorage.setItem('cw_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    try {
      const profileRes = await api.get('/auth/me');
      setUser(profileRes.data);
    } catch {
      // Use partial user data
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('cw_token');
    localStorage.removeItem('cw_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
