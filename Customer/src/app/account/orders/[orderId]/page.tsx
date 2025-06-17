// Customer/src/app/account/orders/[orderId]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import { Loader2, AlertCircleIcon, PackageIcon, HomeIcon, CreditCardIcon, ListOrderedIcon, ChevronLeftIcon } from 'lucide-react';
import type { Address as PrismaAddress } from '@prisma/client'; // Type-only import for Prisma's Address

// Client-side interface for Address, ensuring no server-only types are bundled.
interface ClientAddress extends Omit<PrismaAddress, 'userId' | 'createdAt' | 'updatedAt'> {}


interface OrderItemDetail {
  id: string; // CartItem ID (from Prisma)
  sanityId: string; // Sanity Product document _id (used for linking, ideally should be slug)
  name: string;
  thumbnail: string;
  color: string;
  size: string;
  count: number;
  price: number; // Unit price, already converted from cents by API
}

interface DeliveryDetail {
  id: string;
  email: string;
  phone: string;
  address: ClientAddress; // Use client-safe Address type
}

interface OrderDetail {
  id: string;
  createdAt: string;
  order_status: string;
  payment_status: string;
  delivery_status?: string;
  shipping_method?: string;
  payment_method?: string;
  orderItems: OrderItemDetail[];
  delivery?: DeliveryDetail;
  totalAmount: number;
}

type BadgeVariant = VariantProps<typeof Badge>["variant"];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId || !isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/account/orders/${orderId}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Failed to fetch order details' }));
        if (response.status === 404) {
            throw new Error("Order not found or you don't have permission to view it.");
        }
        throw new Error(errData.error || 'Failed to fetch order details');
      }
      const data: OrderDetail = await response.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Could not load your order details.');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, isAuthenticated]); // Added isAuthenticated to dependency array


  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace(`/sign-in?callbackUrl=/account/orders/${orderId}`);
    }
    if (isAuthenticated && orderId) {
      fetchOrderDetail();
    }
  }, [isAuthenticated, authIsLoading, router, orderId, fetchOrderDetail]);


  const getStatusBadgeVariant = (status?: string): BadgeVariant => {
    switch (status?.toUpperCase()) {
        case 'PENDING': return 'outline';
        case 'PROCESSING': return 'secondary';
        case 'PAID':
        case 'FULFILLED':
        case 'DELIVERED': return 'default';
        case 'REJECTED':
        case 'CANCELLED': return 'destructive';
        default: return 'secondary';
    }
  };

  if (authIsLoading || (isLoading && !order && !error)) { // Show loading if auth is loading OR data is loading for the first time (and no error yet)
    return <div className="container mx-auto px-4 py-12 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /> <p className="mt-2 text-sm text-gray-500">Loading order details...</p></div>;
  }
  if (!isAuthenticated && !authIsLoading) {
     return <div className="container mx-auto px-4 py-12 text-center text-gray-500">Redirecting to sign-in...</div>;
  }
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertCircleIcon className="mx-auto h-12 w-12 text-red-500 mb-3" />
        <p className="text-lg font-medium text-red-600">Error loading order</p>
        <p className="text-sm text-gray-500 mt-1 mb-4">{error}</p>
        <Button onClick={() => fetchOrderDetail()} className="mr-2">Try Again</Button>
        <Button variant="outline" asChild><Link href="/account/orders">Back to Orders</Link></Button>
      </div>
    );
  }
  if (!order) { // This case handles if fetch completed but order is null (e.g. API returned null for some reason not caught as error)
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <PackageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Order Not Found</h2>
        <p className="text-gray-500 mt-2 mb-6">The requested order could not be found.</p>
        <Button asChild><Link href="/account/orders">Back to My Orders</Link></Button>
      </div>
    );
  }

  const shippingAddress = order.delivery?.address;
  const itemsSubtotal = order.orderItems.reduce((sum, item) => sum + (item.price * item.count), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
            <Link href="/account/orders"><ChevronLeftIcon className="h-4 w-4 mr-1" /> Back to Orders</Link>
        </Button>
      </div>

      <Card className="shadow-lg border">
        <CardHeader className="bg-gray-50/80 p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Order Details</h1>
              <p className="text-sm text-primary font-medium">Order ID: {order.id}</p>
            </div>
            <p className="text-sm text-gray-500 mt-1 sm:mt-0">
              Placed on: {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><p className="font-medium text-gray-500 mb-0.5">Order Status</p><Badge variant={getStatusBadgeVariant(order.order_status)} className="text-xs py-0.5 px-2 whitespace-nowrap">{order.order_status || 'N/A'}</Badge></div>
            <div><p className="font-medium text-gray-500 mb-0.5">Payment Status</p><Badge variant={getStatusBadgeVariant(order.payment_status)} className="text-xs py-0.5 px-2 whitespace-nowrap">{order.payment_status || 'N/A'}</Badge></div>
            {order.delivery_status && <div><p className="font-medium text-gray-500 mb-0.5">Delivery Status</p><Badge variant={getStatusBadgeVariant(order.delivery_status)} className="text-xs py-0.5 px-2 whitespace-nowrap">{order.delivery_status}</Badge></div>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
            {shippingAddress && (
              <div className="space-y-1">
                <h3 className="text-md font-semibold text-gray-700 flex items-center mb-1.5"><HomeIcon className="h-5 w-5 mr-2 text-gray-400" />Shipping Address</h3>
                <div className="pl-7 text-sm text-gray-600">
                    <p>{shippingAddress.fname} {shippingAddress.lname}</p>
                    <p>{shippingAddress.line_1}{shippingAddress.line_2 ? `, ${shippingAddress.line_2}` : ''}</p>
                    <p>{shippingAddress.city}, {shippingAddress.postal_code}</p>
                    <p>{shippingAddress.country}</p>
                    <p>Phone: {shippingAddress.phone}</p>
                </div>
              </div>
            )}
            <div className="space-y-1">
              <h3 className="text-md font-semibold text-gray-700 flex items-center mb-1.5"><CreditCardIcon className="h-5 w-5 mr-2 text-gray-400" />Payment Details</h3>
              <div className="pl-7 text-sm text-gray-600">
                <p><span className="font-medium">Method:</span> {order.payment_method === 'COD' ? 'Cash on Delivery' : order.payment_method || 'N/A'}</p>
                {order.shipping_method && <p className="mt-1"><span className="font-medium">Shipping:</span> {order.shipping_method}</p>}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center"><ListOrderedIcon className="h-5 w-5 mr-2 text-gray-400" />Items Ordered ({order.orderItems.length})</h3>
            <ul role="list" className="divide-y divide-gray-100 border-y border-gray-100">
              {order.orderItems.map((item) => (
                <li key={item.id} className="flex py-4 items-center gap-4">
                  <div className="flex-shrink-0">
                    <Image
                      src={item.thumbnail || '/placeholder-image.png'}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-md object-cover border"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* NOTE: item.sanityId is the Sanity document _id, not slug. Link will not work as is. Needs API to return slug. */}
                    <h4 className="text-sm font-medium text-gray-800 truncate hover:text-primary"><Link href={`/product/${item.sanityId}`}>{item.name}</Link></h4>
                    <p className="text-xs text-gray-500 truncate">
                      {item.color !== 'N/A' ? item.color : ''}{item.color !== 'N/A' && item.size !== 'N/A' ? ' / ' : ''}{item.size !== 'N/A' ? item.size : ''}
                    </p>
                    <p className="text-xs text-gray-500">Qty: {item.count}</p>
                  </div>
                  <div className="text-right text-sm font-medium text-gray-800 whitespace-nowrap">
                    ₹{(item.price * item.count).toFixed(2)}
                    {item.count > 1 && <p className="text-xs text-gray-500 font-normal whitespace-nowrap">(₹{item.price.toFixed(2)} each)</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6 border-t text-sm space-y-1 text-right">
             <div className="flex justify-between">
                <p className="text-gray-600">Subtotal:</p>
                <p className="font-medium text-gray-800">₹{itemsSubtotal.toFixed(2)}</p>
             </div>
             {/* Shipping costs, taxes, discounts would go here */}
             <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t mt-2">
                <p>Grand Total:</p>
                <p>₹{order.totalAmount.toFixed(2)}</p>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
