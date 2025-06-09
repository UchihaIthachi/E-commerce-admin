"use client";

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RequestPasswordResetPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null); // For both success and error feedback, but generic
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    if (!email) {
      setMessage("Email is required."); // Or rely on API's generic message
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json(); // API always returns 200 with a message for this route

      if (response.ok) {
        setMessage(data.message || 'If an account with that email exists, a password reset link has been sent.');
      } else {
        // Should ideally not happen if API behaves as designed (always 200)
        // But handle defensively
        setMessage(data.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      console.error("Request password reset failed:", err);
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your email address and we will send you a link to reset your password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className={`border px-4 py-3 rounded relative ${message.includes("error") ? "bg-red-100 border-red-400 text-red-700" : "bg-green-100 border-green-400 text-green-700"}`} role="alert">
              <span className="block sm:inline">{message}</span>
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm">
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
