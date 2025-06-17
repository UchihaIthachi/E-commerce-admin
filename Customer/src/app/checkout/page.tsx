// Customer/src/app/checkout/page.tsx
"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useCartStore } from '@/store/useCartStore';
import type { CartItemType } from '@/store/useCartStore'; // AddToCartPayload is not directly used by this page, but CartItemType is.
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'; // Added Loader2
import Link from 'next/link';

interface ShippingAddressForm {
  fname: string;
  lname: string;
  country: string;
  phone: string;
  line_1: string;
  line_2?: string;
  city: string;
  postal_code: string;
}

const initialShippingAddress: ShippingAddressForm = {
  fname: '', lname: '', country: 'India', phone: '', line_1: '', city: '', postal_code: '' // Default country
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const { cart, totalAmount, totalItems, clearCart } = useCartStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressForm>(initialShippingAddress);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | ''>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace('/sign-in?callbackUrl=/checkout');
    }
    if (!authIsLoading && isAuthenticated && totalItems === 0 && !successInfo) {
      router.replace('/cart');
    }
  }, [isAuthenticated, authIsLoading, router, totalItems, successInfo]);

  useEffect(() => {
      if (user) {
          setShippingAddress(prev => ({
              ...prev,
              fname: user.fname || user.name?.split(' ')[0] || '',
              lname: user.lname || user.name?.split(' ').slice(1).join(' ') || '',
              // phone: user.phone_1 || '', // User might not have phone_1 consistently
              // country: user.country || 'India', // User might not have country
          }));
      }
  }, [user]);


  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const validateShippingAddress = (): boolean => {
    const requiredFields: (keyof ShippingAddressForm)[] = ['fname', 'lname', 'country', 'phone', 'line_1', 'city', 'postal_code'];
    for (const key of requiredFields) {
      if (!shippingAddress[key] || shippingAddress[key].trim() === '') {
        setError(`Please fill in all required shipping fields. Missing: ${key.replace('_', ' ')}`);
        return false;
      }
    }
    if (shippingAddress.phone.length < 10) {
        setError("Phone number seems too short.");
        return false;
    }
    if (shippingAddress.postal_code.length < 5) {
        setError("Postal code seems too short.");
        return false;
    }
    setError(null);
    return true;
  };

  const handleNextStep = () => {
    setError(null);
    if (currentStep === 1 && !validateShippingAddress()) return;
    if (currentStep === 2 && !paymentMethod) {
        setError("Please select a payment method.");
        return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setError(null);
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmitOrder = async () => {
    if (currentStep !== 3) { // Should only submit from review step
        setCurrentStep(3); // Go to review step if not there
        return;
    }
    if (!validateShippingAddress()) { // Validate shipping again just in case
        setCurrentStep(1); // Go back to shipping
        return;
    }
    if (!paymentMethod) {
         setError("Please select a payment method first.");
         setCurrentStep(2);
         return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessInfo(null);

    const orderPayload = {
      cartItems: cart.map(item => ({
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        // Correctly send unit price
        price: item.quantity > 0 ? item.price / item.quantity : 0,
        originalPrice: item.quantity > 0 ? item.originalPrice / item.quantity : 0,
        imageUrl: item.imageUrl,
        imageAlt: item.imageAlt,
        quantity: item.quantity,
        variantId: item.variantId,
        variantName: item.variantName,
      })),
      newShippingAddress: shippingAddress,
      clientTotalAmount: totalAmount,
    };

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessInfo(`Order placed successfully! Order ID: ${result.orderId}`);
        clearCart(); // Clear cart from Zustand store
        // Redirect to a dedicated order confirmation page
        router.push(`/order-confirmation?orderId=${result.orderId}`); // Example redirect
      } else {
        setError(result.error || 'Failed to place order.');
        if (result.details) console.error("Order submission validation errors:", result.details);
      }
    } catch (err) {
      console.error("Order submission error:", err);
      setError('An unexpected error occurred while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authIsLoading || (!isAuthenticated && !authIsLoading)) {
    return <div className="container mx-auto px-4 py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /> Loading checkout...</div>;
  }

  if (totalItems === 0 && !successInfo) {
      return (
          <div className="container mx-auto px-4 py-12 text-center">
              <h2 className="text-xl font-semibold">Your cart is empty. Redirecting to cart...</h2>
              {/* Redirect is handled by useEffect, this is a fallback message */}
          </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

      <div className="mb-8 flex justify-center items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
        <div className={`flex items-center ${currentStep >= 1 ? 'text-primary font-semibold' : 'text-gray-500'}`}>
            <span className={`mr-1 sm:mr-2 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-300'}`}>1</span> Shipping
        </div>
        <div className={`w-8 sm:w-12 h-px ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-300'}`}></div>
        <div className={`flex items-center ${currentStep >= 2 ? 'text-primary font-semibold' : 'text-gray-500'}`}>
            <span className={`mr-1 sm:mr-2 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-300'}`}>2</span> Payment
        </div>
        <div className={`w-8 sm:w-12 h-px ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-300'}`}></div>
        <div className={`flex items-center ${currentStep >= 3 ? 'text-primary font-semibold' : 'text-gray-500'}`}>
            <span className={`mr-1 sm:mr-2 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-300'}`}>3</span> Review
        </div>
      </div>

      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">
            {currentStep === 1 && 'Shipping Address'}
            {currentStep === 2 && 'Payment & Shipping Method'}
            {currentStep === 3 && 'Review Your Order'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md relative flex items-center text-sm">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {currentStep === 1 && (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label htmlFor="fname">First Name *</Label><Input id="fname" name="fname" value={shippingAddress.fname} onChange={handleShippingChange} required /></div>
                <div><Label htmlFor="lname">Last Name *</Label><Input id="lname" name="lname" value={shippingAddress.lname} onChange={handleShippingChange} required /></div>
              </div>
              <div><Label htmlFor="phone">Phone *</Label><Input id="phone" name="phone" type="tel" value={shippingAddress.phone} onChange={handleShippingChange} required placeholder="e.g., 9876543210" /></div>
              <div><Label htmlFor="line_1">Address Line 1 *</Label><Input id="line_1" name="line_1" value={shippingAddress.line_1} onChange={handleShippingChange} required /></div>
              <div><Label htmlFor="line_2">Address Line 2</Label><Input id="line_2" name="line_2" value={shippingAddress.line_2 || ''} onChange={handleShippingChange} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label htmlFor="city">City *</Label><Input id="city" name="city" value={shippingAddress.city} onChange={handleShippingChange} required /></div>
                <div><Label htmlFor="postal_code">Postal Code *</Label><Input id="postal_code" name="postal_code" value={shippingAddress.postal_code} onChange={handleShippingChange} required /></div>
              </div>
              <div><Label htmlFor="country">Country *</Label><Input id="country" name="country" value={shippingAddress.country} onChange={handleShippingChange} required /></div>
            </form>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
                <div>
                    <h3 className="text-md font-semibold mb-2 text-gray-800">Shipping Method</h3>
                    <div className="p-4 border rounded-md bg-gray-50">
                        <p className="text-sm font-medium">Standard Delivery</p>
                        <p className="text-xs text-gray-500">Estimated 3-5 business days (Free - Placeholder)</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-md font-semibold mb-2 text-gray-800">Payment Method *</h3>
                    <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'COD' | '')}>
                        <Label htmlFor="cod" className={`flex items-center space-x-3 p-4 border rounded-md hover:border-primary cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200'}`}>
                            <RadioGroupItem value="COD" id="cod" />
                            <span className="font-medium">Cash on Delivery (COD)</span>
                        </Label>
                    </RadioGroup>
                </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 text-sm">
              <div>
                <h4 className="font-semibold mb-1 text-gray-800">Shipping To:</h4>
                <div className="text-gray-600 pl-2 border-l-2">
                    <p>{shippingAddress.fname} {shippingAddress.lname}</p>
                    <p>{shippingAddress.line_1}{shippingAddress.line_2 ? `, ${shippingAddress.line_2}` : ''}</p>
                    <p>{shippingAddress.city}, {shippingAddress.postal_code}</p>
                    <p>{shippingAddress.country} - Ph: {shippingAddress.phone}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-gray-800">Payment Method:</h4>
                <p className="text-gray-600 pl-2 border-l-2">{paymentMethod === 'COD' ? 'Cash on Delivery' : 'Not Selected'}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-800">Order Summary ({totalItems} item{totalItems > 1 ? 's' : ''}):</h4>
                <ul className="divide-y divide-gray-200 border-y border-gray-200">
                  {cart.map(item => (
                    <li key={item.cartItemId} className="py-3 flex justify-between items-center">
                      <div>
                        <span className="font-medium text-gray-800">{item.name}</span>
                        {item.variantName && <span className="text-xs text-gray-500 ml-1">({item.variantName})</span>}
                        <span className="text-xs text-gray-500 block">Qty: {item.quantity}</span>
                      </div>
                      <span className="font-medium text-gray-800">₹{(item.price).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-gray-300 font-bold text-lg flex justify-between text-gray-900">
                  <span>Order Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pt-6">
          {currentStep > 1 && <Button variant="outline" onClick={handlePrevStep} disabled={isSubmitting}>Previous</Button>}
          {currentStep < 3 && <Button onClick={handleNextStep} disabled={isSubmitting} className={currentStep === 1 ? 'ml-auto': ''}>Next</Button>}
          {/* Ensured full validation check is implicitly handled by step progression or direct submit logic */}
          {currentStep === 3 && <Button onClick={handleSubmitOrder} disabled={isSubmitting || cart.length === 0}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing Order...</> : 'Place Order (COD)'}
          </Button>}
        </CardFooter>
      </Card>
    </div>
  );
}
