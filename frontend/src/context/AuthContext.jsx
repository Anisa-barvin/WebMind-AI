import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and load user profile on startup if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
          setStats(res.data.stats);
        } catch (error) {
          console.error('Failed to load user profile, logging out:', error);
          logout();
        }
      }
      setIsLoading(false);
    };
    
    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authAPI.login(email, password);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      // Wait for profile stats retrieval
      const profileRes = await authAPI.getMe();
      setStats(profileRes.data.stats);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        error: error.response?.data?.error || 'Invalid credentials'
      };
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const res = await authAPI.register(name, email, password);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      // Stats will be empty defaults
      setStats({
        totalWebsites: 0,
        trainedWebsites: 0,
        totalQuestions: 0,
        totalAnswers: 0
      });
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setStats(null);
  };

  const refreshStats = async () => {
    if (token) {
      try {
        const res = await authAPI.getMe();
        setStats(res.data.stats);
      } catch (err) {
        console.error('Failed to refresh stats', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        stats,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshStats
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
