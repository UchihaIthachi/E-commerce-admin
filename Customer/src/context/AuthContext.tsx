"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // For potential redirects

// 1. Define User Type
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string; // Consider using an enum if roles are well-defined e.g. import { Role } from '@prisma/client';
  // Add any other user-specific fields you expect from the session
}

// 2. Define AuthContext Value Interface
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean; // Derived from user !== null for convenience
  login: (userData: User) => void; // Simplified login, primarily for client-side state update after external login
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  checkSession: () => Promise<void>; // Function to manually re-check session
}

// 3. Create AuthContext
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// 4. Implement AuthProvider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true for initial session check
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Function to check session status
  const checkSession = useCallback(async () => {
    setIsLoading(true);
    clearError();
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null); // No user in session
        }
      } else if (response.status === 401) {
        setUser(null); // Unauthorized, no active session
      } else {
        // Other non-OK responses
        const errorData = await response.json().catch(() => ({ error: "Failed to fetch session" }));
        setError(errorData.error || 'Failed to fetch session');
        setUser(null);
      }
    } catch (err) {
      console.error("checkSession error:", err);
      setError('An error occurred while checking session.');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Initial session check on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Login function (primarily updates client state; actual login happens via API routes)
  const login = useCallback((userData: User) => {
    setUser(userData);
    setIsLoading(false); // Ensure loading is false after login state update
    clearError();
  }, [clearError]);

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    clearError();
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) {
        // Try to parse error, but still logout client-side
        const errorData = await response.json().catch(() => ({ error: "Logout failed on server" }));
        console.error("Server logout error:", errorData.error);
        // Don't necessarily set global error here, as client-side logout will proceed
      }
    } catch (err) {
      console.error("Logout API call error:", err);
      // Don't necessarily set global error here
    } finally {
      setUser(null);
      // Cookies are cleared by the server. Client-side cannot reliably clear HttpOnly cookies.
      // Forcing a reload or redirect might help ensure client state is fully reset.
      // router.push('/sign-in'); // Example redirect
      setIsLoading(false);
      // Optionally, call checkSession() again to confirm logout with server, though usually not needed.
    }
  }, [clearError /*, router */]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout, error, clearError, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

// 5. Create useAuth Hook
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
