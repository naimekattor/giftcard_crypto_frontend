'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/features/auth/services/authService';

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface AuthUser {
  email: string;
  role: UserRole;
  roles: UserRole[];
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  switchActiveRole: (role: UserRole) => Promise<void>;
  upgradeToRole: (role: 'buyer' | 'seller') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'gc_jwt_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newUser: AuthUser) => {
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchActiveRole = async (role: UserRole) => {
    if (!user) return;
    try {
      const res = await authService.switchRole(role, user.token);
      const updatedUser: AuthUser = {
        email: res.email,
        role: (res.activeRole || res.role) as UserRole,
        roles: (res.roles || [res.role]) as UserRole[],
        token: res.token,
      };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to switch role');
    }
  };

  const upgradeToRole = async (role: 'buyer' | 'seller') => {
    if (!user) return;
    try {
      const res = await authService.upgradeRole(role, user.token);
      const updatedUser: AuthUser = {
        email: res.email,
        role: (res.activeRole || res.role) as UserRole,
        roles: (res.roles || [res.role]) as UserRole[],
        token: res.token,
      };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to upgrade role');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout, switchActiveRole, upgradeToRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
