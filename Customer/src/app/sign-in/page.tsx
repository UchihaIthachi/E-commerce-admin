"use client";

import React, { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // For reading callbackUrl
  const auth = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      router.push(callbackUrl);
    }
  }, [auth.isAuthenticated, router, searchParams]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    auth.clearError(); // Clear global auth error
    setLoading(true);

    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await auth.checkSession();
        // useEffect will handle redirection based on isAuthenticated and callbackUrl
        // If not using useEffect for this, redirect here:
        // const callbackUrl = searchParams.get('callbackUrl') || '/';
        // router.push(callbackUrl);
      } else {
        // Handle Zod validation errors from API if details are provided
        if (data.details) {
          // Example: concatenate all email errors if they exist
          const emailErrors = data.details.email?.join(', ');
          const passwordErrors = data.details.password?.join(', ');
          let errorMessage = data.error || 'Login failed.';
          if (emailErrors) errorMessage += ` Email: ${emailErrors}`;
          if (passwordErrors) errorMessage += ` Password: ${passwordErrors}`;
          setError(errorMessage);
        } else {
          setError(data.error || 'Login failed. Please try again.');
        }
      }
    } catch (err: any) {
      console.error("Login request failed:", err);
      const message = err.message || 'An unexpected error occurred. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading or null if auth.isLoading or already authenticated (to avoid flash of form)
  if (auth.isLoading || auth.isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* You can put a global loading spinner here */}
        Loading...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>Enter your email and password to access your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <GoogleLoginButton text="Sign in with Google" />
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-sm">
          <div className="text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="font-medium text-primary hover:underline">
              Sign Up
            </Link>
          </div>
          <div className="text-muted-foreground">
            Forgot your password?{' '}
            <Link href="/request-password-reset" className="font-medium text-primary hover:underline">
              Reset Password
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
