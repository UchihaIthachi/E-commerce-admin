"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // For potential redirects
import { useCartStore } from '@/store/useCartStore'; // Import cart store
import type { CartItemType } from '@/store/useCartStore'; // Import type for cart items

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
          await fetchAndSetDbCart(); // Fetch cart after setting user
        } else {
          setUser(null); // No user in session
          useCartStore.getState().setCart([]); // Clear cart if no user session
        }
      } else if (response.status === 401) {
        setUser(null); // Unauthorized, no active session
        useCartStore.getState().setCart([]); // Clear cart on 401
      } else {
        // Other non-OK responses
        const errorData = await response.json().catch(() => ({ error: "Failed to fetch session" }));
        setError(errorData.error || 'Failed to fetch session');
        setUser(null);
        useCartStore.getState().setCart([]); // Clear cart on other errors too
      }
    } catch (err) {
      console.error("checkSession error:", err);
      setError('An error occurred while checking session.');
      setUser(null);
      useCartStore.getState().setCart([]); // Clear cart on catch
    } finally {
      setIsLoading(false);
    }
  }, [clearError, fetchAndSetDbCart]); // Added fetchAndSetDbCart

  // Initial session check on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Function to fetch DB cart and set it to Zustand store
  const fetchAndSetDbCart = useCallback(async () => {
    // console.log("Attempting to fetch DB cart...");
    try {
      const response = await fetch('/api/cart'); // GET request
      if (response.ok) {
        const data = await response.json(); // Expects { cart: CartItemType[] }
        if (data && Array.isArray(data.cart)) {
          useCartStore.getState().setCart(data.cart as CartItemType[]);
          // console.log("DB cart fetched and set to Zustand store:", data.cart);
        } else {
          // This case means API returned 200 OK but cart data is not as expected (e.g. {cart: []} is fine)
          // console.warn("Fetched DB cart, but data format is unexpected:", data);
          useCartStore.getState().setCart([]); // Ensure cart is empty if data is malformed
        }
      } else if (response.status !== 401) {
        // Don't treat 401 as an error for cart fetching, it just means user is not logged in
        // or has no persistent cart, which is fine (local cart will be used or new cart created).
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch DB cart, status:", response.status, errorData.error || response.statusText);
      } else {
        // console.log("No persistent cart found for user (401) or user not logged in.");
        // Optionally, ensure local cart is cleared if a 401 implies session ended elsewhere
        // useCartStore.getState().setCart([]); // Or handle based on specific app logic for 401 on cart fetch
      }
    } catch (error) {
      console.error("Error during fetchAndSetDbCart:", error);
    }
  }, []); // Empty dependency array: fetch and setCart are stable references from Zustand/built-in

  // Login function (primarily updates client state; actual login happens via API routes)
  const login = useCallback(async (userData: User) => { // Made async
    setUser(userData);
    setIsLoading(false);
    clearError();
    await fetchAndSetDbCart(); // Fetch cart after login
  }, [clearError, fetchAndSetDbCart]);

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    clearError();
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Logout failed on server" }));
        console.error("Server logout error:", errorData.error);
      }
    } catch (err) {
      console.error("Logout API call error:", err);
    } finally {
      setUser(null);
      useCartStore.getState().clearCart(); // Clear Zustand cart on logout
      // Cookies are cleared by the server.
      setIsLoading(false);
    }
  }, [clearError]);

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
