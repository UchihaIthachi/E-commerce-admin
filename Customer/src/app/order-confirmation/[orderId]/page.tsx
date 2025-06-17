// Customer/src/app/order-confirmation/[orderId]/page.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBagIcon } from 'lucide-react';
import { Card } from '@/components/ui/card'; // Using ShadCN Card

export default function OrderConfirmationPage() {
  const params = useParams();
  // Ensure orderId is always a string, even if it might be string[] from params
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-gray-50 py-12 px-4 text-center">
      <Card className="w-full max-w-lg p-8 shadow-xl"> {/* Applied Card component from ShadCN */}
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-5 sm:h-20 sm:w-20" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
          Thank You For Your Order!
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-4">
          Your order has been placed successfully and is being processed.
        </p>
        {orderId && (
          <p className="text-md text-gray-700 mb-6 bg-gray-100 px-3 py-2 rounded-md inline-block">
            Order ID: <span className="font-semibold text-primary">{orderId}</span>
          </p>
        )}
        <p className="text-sm text-gray-500 mb-8">
          You will receive an email confirmation shortly (Note: Email system is not yet implemented).
        </p>

        <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">
              <ShoppingBagIcon className="mr-2 h-5 w-5" /> Continue Shopping
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="/account/orders">
              {/* This page will be built in Phase 4 */}
              View My Orders
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
