"use client";

import React, { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth(); // Use the auth context

  // Redirect if already authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      router.push('/');
    }
  }, [auth.isAuthenticated, router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    auth.clearError(); // Clear global auth error if it were used
    setSuccessMessage(null);
    setLoading(true);

    if (!name || !email || !password) {
      setError("Name, email, and password are required.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Registration successful! Please sign in.');
        // Optionally redirect to sign-in after a short delay or let user click
        setTimeout(() => {
          router.push('/sign-in');
        }, 2000);
      } else {
        // Handle Zod validation errors from API if details are provided
        if (data.details) {
          let messages: string[] = [];
          for (const key in data.details) {
            if (data.details[key]) {
              messages.push(`${key}: ${data.details[key].join(', ')}`);
            }
          }
          setError(messages.length > 0 ? messages.join('; ') : (data.error || 'Registration failed. Please try again.'));
        } else {
          setError(data.error || 'Registration failed. Please try again.');
        }
      }
    } catch (err: any) {
      console.error("Registration request failed:", err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading or null if auth.isLoading or already authenticated (to avoid flash of form)
  if (auth.isLoading || auth.isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Enter your details to get started.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
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
                minLength={6}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
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
          <GoogleLoginButton text="Sign up with Google" />
        </CardContent>
        <CardFooter className="text-sm">
          <div className="text-muted-foreground">
            Already have an account?{' '}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
