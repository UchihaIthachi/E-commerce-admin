// Customer/src/app/account/addresses/page.tsx
"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircleIcon, EditIcon, Trash2Icon, StarIcon, Loader2, AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';
// Using client-side specific types rather than direct Prisma type import in client component
// import type { Address as PrismaAddress } from '@prisma/client';

// Client-side representation of Address data
interface ClientAddressBase {
  fname: string;
  lname: string;
  country: string;
  phone: string;
  line_1: string;
  line_2?: string | null; // Prisma schema allows null for optional strings
  city: string;
  postal_code: string;
  primary: boolean;
}

interface ClientAddressForm extends ClientAddressBase {} // For form data, no ID
interface ClientAddress extends ClientAddressBase { // For displaying addresses, includes id
  id: string;
  // userId, createdAt, updatedAt are not typically needed in client-side form/display logic directly
}


const initialAddressFormState: ClientAddressForm = {
  fname: '', lname: '', country: 'India', phone: '', line_1: '', line_2: '', city: '', postal_code: '', primary: false,
};

export default function AddressesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth();

  const [addresses, setAddresses] = useState<ClientAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ClientAddressForm>(initialAddressFormState);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAddresses = async () => {
    if (!isAuthenticated) return;
    setIsLoadingAddresses(true);
    setError(null); // Clear previous errors before fetching
    try {
      const response = await fetch('/api/account/addresses');
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch addresses');
      }
      const data = await response.json();
      setAddresses(data as ClientAddress[]); // Cast to ClientAddress, API should match
    } catch (err: any) {
      setError(err.message || 'Could not load addresses.');
      setAddresses([]);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace('/sign-in?callbackUrl=/account/addresses');
    }
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated, authIsLoading, router]); // Removed fetchAddresses from dep array as it's stable

  useEffect(() => {
    if (showForm && !isEditingId && user) {
        setFormData(prev => ({
            ...initialAddressFormState,
            fname: user.fname || user.name?.split(' ')[0] || '',
            lname: user.lname || user.name?.split(' ').slice(1).join(' ') || '',
            phone: user.phone_1 || '',
            country: user.country || 'India',
        }));
    }
  }, [showForm, isEditingId, user]); // Corrected dependency: isEditingId (not !isEditingId)


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
    setFormData(prev => ({ ...prev, primary: Boolean(checked) }));
  };

  const handleShowAddForm = () => {
    setIsEditingId(null);
    // Pre-fill with user data if available, otherwise initial state
    if (user) {
         setFormData({
            ...initialAddressFormState,
            fname: user.fname || user.name?.split(' ')[0] || '',
            lname: user.lname || user.name?.split(' ').slice(1).join(' ') || '',
            phone: user.phone_1 || '',
            country: user.country || 'India',
        });
    } else {
        setFormData(initialAddressFormState);
    }
    setShowForm(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleShowEditForm = (address: ClientAddress) => {
    setIsEditingId(address.id);
    const formValues: ClientAddressForm = {
        fname: address.fname || '',
        lname: address.lname || '',
        country: address.country || '',
        phone: address.phone || '',
        line_1: address.line_1 || '',
        line_2: address.line_2 || '',
        city: address.city || '',
        postal_code: address.postal_code || '',
        primary: address.primary || false,
    };
    setFormData(formValues);
    setShowForm(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const requiredFields: (keyof ClientAddressForm)[] = ['fname', 'lname', 'country', 'phone', 'line_1', 'city', 'postal_code'];
    for (const key of requiredFields) {
      if (!formData[key] || String(formData[key]).trim() === '') { // Ensure string check for all
        setError(`Field "${key.replace('_', ' ')}" is required.`);
        setIsSubmitting(false);
        return;
      }
    }
     // Basic phone validation (example)
    if (!/^\+?[1-9]\d{7,14}$/.test(formData.phone)) {
        setError('Invalid phone number format.');
        setIsSubmitting(false);
        return;
    }


    const url = isEditingId ? `/api/account/addresses/${isEditingId}` : '/api/account/addresses';
    const method = isEditingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(isEditingId ? 'Address updated successfully!' : 'Address added successfully!');
        setShowForm(false);
        setIsEditingId(null); // Reset editing state
        fetchAddresses();
      } else {
        setError(result.error || (result.details ? JSON.stringify(result.details) : 'An error occurred.'));
      }
    } catch (err: any) {
      setError(err.message || 'A network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(`/api/account/addresses/${addressId}`, { method: 'DELETE' });
      if (response.ok) {
        setSuccessMessage('Address deleted successfully!');
        fetchAddresses();
      } else {
        const result = await response.json().catch(() => ({}));
        setError(result.error || 'Failed to delete address.');
      }
    } catch (err: any) {
      setError(err.message || 'A network error occurred while deleting address.');
    }
  };

  const handleSetPrimary = async (addressId: string) => {
    setError(null);
    setSuccessMessage(null);
    try {
        const response = await fetch(`/api/account/addresses/${addressId}/set-primary`, { method: 'PATCH' });
        if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(result.error || 'Failed to set primary address');
        }
        setSuccessMessage('Primary address updated!');
        fetchAddresses();
    } catch (err: any) {
        setError(err.message || 'A network error occurred while setting primary address.');
    }
  };

  if (authIsLoading) {
    return <div className="container mx-auto px-4 py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /> Loading...</div>;
  }
  if (!isAuthenticated && !authIsLoading) {
    return <div className="container mx-auto px-4 py-12 text-center">Redirecting to sign-in...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Addresses</h1>
        {!showForm && (
          <Button onClick={handleShowAddForm} size="sm">
            <PlusCircleIcon className="mr-2 h-4 w-4" /> Add New
          </Button>
        )}
      </div>

      {error && (
        <div role="alert" className="mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md flex items-center text-sm">
          <AlertCircleIcon className="h-5 w-5 mr-2 shrink-0" /> {error}
        </div>
      )}
      {successMessage && (
        <div role="alert" className="mb-4 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-md flex items-center text-sm">
          <CheckCircle2Icon className="h-5 w-5 mr-2 shrink-0" /> {successMessage}
        </div>
      )}

      {showForm && (
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">{isEditingId ? 'Edit Address' : 'Add New Address'}</CardTitle>
          </CardHeader>
          <form onSubmit={handleFormSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label htmlFor="form-fname">First Name *</Label><Input id="form-fname" name="fname" value={formData.fname || ''} onChange={handleInputChange} required disabled={isSubmitting} /></div>
                <div><Label htmlFor="form-lname">Last Name *</Label><Input id="form-lname" name="lname" value={formData.lname || ''} onChange={handleInputChange} required disabled={isSubmitting} /></div>
              </div>
              <div><Label htmlFor="form-phone">Phone *</Label><Input id="form-phone" name="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} required disabled={isSubmitting} /></div>
              <div><Label htmlFor="form-line_1">Address Line 1 *</Label><Input id="form-line_1" name="line_1" value={formData.line_1 || ''} onChange={handleInputChange} required disabled={isSubmitting} /></div>
              <div><Label htmlFor="form-line_2">Address Line 2</Label><Input id="form-line_2" name="line_2" value={formData.line_2 || ''} onChange={handleInputChange} disabled={isSubmitting} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label htmlFor="form-city">City *</Label><Input id="form-city" name="city" value={formData.city || ''} onChange={handleInputChange} required disabled={isSubmitting} /></div>
                <div><Label htmlFor="form-postal_code">Postal Code *</Label><Input id="form-postal_code" name="postal_code" value={formData.postal_code || ''} onChange={handleInputChange} required disabled={isSubmitting} /></div>
              </div>
              <div><Label htmlFor="form-country">Country *</Label><Input id="form-country" name="country" value={formData.country || ''} onChange={handleInputChange} required disabled={isSubmitting} /></div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="form-primary" name="primary" checked={formData.primary || false} onCheckedChange={handleCheckboxChange} disabled={isSubmitting} />
                <Label htmlFor="form-primary" className="text-sm font-medium leading-none cursor-pointer">Set as primary address</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-3 border-t pt-4 mt-4">
              <Button variant="outline" type="button" onClick={() => { setShowForm(false); setIsEditingId(null); setError(null); setSuccessMessage(null); }} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditingId ? 'Update Address' : 'Save Address')}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {isLoadingAddresses && !showForm && <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" /></div>}

      {!isLoadingAddresses && addresses.length === 0 && !showForm && (
        <Card className="text-center py-10 shadow-sm">
            <CardContent>
                <h3 className="text-lg font-medium text-gray-700">No Addresses Found</h3>
                <p className="text-sm text-gray-500 mt-1">You haven't added any shipping addresses yet.</p>
                <Button onClick={handleShowAddForm} className="mt-4" size="sm">
                    <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Your First Address
                </Button>
            </CardContent>
        </Card>
      )}

      {!showForm && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {addresses.map(address => (
            <Card key={address.id} className={`shadow-sm transition-all hover:shadow-md flex flex-col ${address.primary ? 'border-2 border-primary ring-1 ring-primary/50' : 'border'}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-md sm:text-lg">
                    {address.fname} {address.lname}
                    </CardTitle>
                    {address.primary && <div className="flex items-center text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                        <StarIcon className="mr-1 h-3 w-3 fill-current" /> Primary
                    </div>}
                </div>
                <CardDescription className="text-xs sm:text-sm">{address.phone}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm text-gray-600 space-y-0.5 pt-0 pb-3 flex-grow">
                <p>{address.line_1}</p>
                {address.line_2 && <p>{address.line_2}</p>}
                <p>{address.city}, {address.postal_code}</p>
                <p>{address.country}</p>
              </CardContent>
              <CardFooter className="flex flex-wrap justify-end gap-2 border-t pt-3 pb-3">
                {!address.primary && (
                  <Button variant="outline" size="xs" onClick={() => handleSetPrimary(address.id)} disabled={isSubmitting}>
                    Set Primary
                  </Button>
                )}
                <Button variant="ghost" size="iconSm" onClick={() => handleShowEditForm(address)} disabled={isSubmitting} className="text-gray-500 hover:text-primary h-7 w-7">
                  <EditIcon className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={() => handleDeleteAddress(address.id)}
                    disabled={isSubmitting || (address.primary && addresses.length ===1)} // Can't delete last primary address
                    className={`text-red-500 hover:text-red-700 h-7 w-7 ${(address.primary && addresses.length ===1) ? 'cursor-not-allowed opacity-50' : ''}`}
                    title={(address.primary && addresses.length ===1) ? "Cannot delete the only primary address." : "Delete address"}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
