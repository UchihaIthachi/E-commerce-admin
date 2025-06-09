"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

// Define a type for the profile data
interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | string | null; // Can be Date object or string from JSON
  image: string | null;
  role: string | null;
  fname: string | null;
  lname: string | null;
  country: string | null;
  phone_1: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    fname: '',
    lname: '',
    country: '',
    phone_1: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/account/profile');
        if (response.status === 401) {
          router.push('/sign-in');
          return;
        }
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch profile');
        }
        const data: UserProfile = await response.json();
        setProfile(data);
        setFormData({
          name: data.name || '',
          image: data.image || '',
          fname: data.fname || '',
          lname: data.lname || '',
          country: data.country || '',
          phone_1: data.phone_1 || '',
        });
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred while fetching your profile.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);

    // Construct payload with only non-empty fields or fields that changed
    // For simplicity here, sending all fields from formData.
    // API will handle which fields it can update.
    const payload = {
        name: formData.name || null, // Send null if empty to potentially clear
        image: formData.image || null,
        fname: formData.fname || null,
        lname: formData.lname || null,
        country: formData.country || null,
        phone_1: formData.phone_1 || null,
    };


    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data); // Update profile with response from server
        setFormData({ // Reset form data to reflect saved state
          name: data.name || '',
          image: data.image || '',
          fname: data.fname || '',
          lname: data.lname || '',
          country: data.country || '',
          phone_1: data.phone_1 || '',
        });
        setSuccessMessage('Profile updated successfully!');
      } else {
        setError(data.error || 'Failed to update profile. Please try again.');
      }
    } catch (err: any) {
      console.error("Profile update request failed:", err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
            <Skeleton className="h-10 w-full md:w-1/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !profile) { // Show full page error if initial load failed and no profile data
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
             <Card className="w-full max-w-md p-6">
                <CardHeader>
                    <CardTitle className="text-red-600">Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                    <Button onClick={() => router.push('/sign-in')} className="mt-4">Go to Sign In</Button>
                </CardContent>
            </Card>
        </div>
    );
  }


  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">My Profile</CardTitle>
          <CardDescription>View and update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && ( // For update errors
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          {profile?.image && (
            <div className="flex justify-center">
              <img src={profile.image} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profile?.email || ''} disabled className="mt-1 bg-gray-100" />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} disabled={isUpdating} className="mt-1" />
                </div>
                <div>
                    <Label htmlFor="fname">First Name</Label>
                    <Input id="fname" name="fname" value={formData.fname} onChange={handleInputChange} disabled={isUpdating} className="mt-1" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="lname">Last Name</Label>
                    <Input id="lname" name="lname" value={formData.lname} onChange={handleInputChange} disabled={isUpdating} className="mt-1" />
                </div>
                <div>
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" name="country" value={formData.country} onChange={handleInputChange} disabled={isUpdating} className="mt-1" />
                </div>
            </div>

            <div>
                <Label htmlFor="phone_1">Phone Number</Label>
                <Input id="phone_1" name="phone_1" value={formData.phone_1} onChange={handleInputChange} disabled={isUpdating} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="image">Profile Image URL</Label>
              <Input id="image" name="image" type="url" value={formData.image} onChange={handleInputChange} disabled={isUpdating} className="mt-1" />
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
          </form>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Role: {profile?.role}</p>
            {profile?.emailVerified && (
                 <p className="text-sm text-muted-foreground">
                    Email Verified: {new Date(profile.emailVerified).toLocaleDateString()}
                </p>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
