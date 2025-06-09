"use client";

import React from 'react';
import { Button } from '@/components/ui/button'; // Assuming ShadCN Button path

interface GoogleLoginButtonProps {
  text?: string;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ text = "Sign in with Google" }) => {
  const handleGoogleLogin = () => {
    // Redirect to our backend endpoint that initiates Google OAuth flow
    window.location.href = '/api/auth/google/login';
  };

  return (
    <Button variant="outline" type="button" onClick={handleGoogleLogin} className="w-full">
      {/* Optionally, add a Google icon here */}
      {text}
    </Button>
  );
};
