"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  collegeId: string;
  college: string;
  phone?: string;
  avatarUrl?: string;
  role: "USER" | "ADMIN" | string;
  isEmailVerified: boolean;
  rating: number;
  totalRatings: number;
  wallet?: {
    id: string;
    balance: number;
  };
  _count?: {
    listings: number;
    bookingsAsRenter: number;
    bookingsAsLender: number;
    favorites: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (loginIdentifier: string, password: string, college?: string) => Promise<any>;
  register: (data: {
    name: string;
    collegeId: string;
    email: string;
    password: string;
    college?: string;
    phone?: string;
    avatarUrl?: string;
  }) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserData: (updatedUser: Partial<User>) => void;
  quickLogin: (loginIdentifier: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // ignore
        }
      }
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const login = async (loginIdentifier: string, password: string, college?: string) => {
    const response = await authApi.login({ loginIdentifier, password, college });
    const { token: newToken, user: userData } = response.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    return response.data;
  };

  const register = async (data: {
    name: string;
    collegeId: string;
    email: string;
    password: string;
    college?: string;
    phone?: string;
    avatarUrl?: string;
  }) => {
    const response = await authApi.register(data);
    const { token: newToken, user: userData } = response.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    return response.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const updateUserData = (updatedUser: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
  };

  const quickLogin = async (loginIdentifier: string) => {
    return login(loginIdentifier, "campus123");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN",
        login,
        register,
        logout,
        refreshUser,
        updateUserData,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

