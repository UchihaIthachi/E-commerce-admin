// Customer/src/app/account/orders/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority'; // For Badge variant type
import { Loader2, AlertCircleIcon, ShoppingBagIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

// Define a type for the badge variant based on ShadCN's Badge component
// This allows getStatusBadgeVariant to return a type that Badge's variant prop expects.
type BadgeVariant = VariantProps<typeof Badge>["variant"];


interface OrderSummary {
  id: string;
  createdAt: string;
  order_status: string;
  payment_status: string;
  delivery_status?: string;
  totalAmount: number;
  itemCount: number;
}

interface FetchOrdersResponse {
  orders: OrderSummary[];
  totalPages: number;
  currentPage: number;
  totalOrders: number;
}

const ITEMS_PER_PAGE = 10;

export default function OrdersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();

  const [ordersData, setOrdersData] = useState<FetchOrdersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const fetchOrders = useCallback(async (page: number) => {
    if (!isAuthenticated) return; // Ensure user is authenticated before fetching
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/account/orders?page=${page}&limit=${ITEMS_PER_PAGE}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Failed to fetch orders' }));
        throw new Error(errData.error || 'Failed to fetch orders');
      }
      const data: FetchOrdersResponse = await response.json();
      setOrdersData(data);
    } catch (err: any) {
      setError(err.message || 'Could not load your orders.');
      setOrdersData(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]); // Added isAuthenticated dependency

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace('/sign-in?callbackUrl=/account/orders');
    }
    if (isAuthenticated) {
      fetchOrders(currentPage);
    }
  }, [isAuthenticated, authIsLoading, router, currentPage, fetchOrders]);


  const handlePageChange = (newPage: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('page', newPage.toString());
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const getStatusBadgeVariant = (status?: string): BadgeVariant => {
    switch (status?.toUpperCase()) {
        case 'PENDING': return 'outline'; // Using outline for pending to be less dominant
        case 'PROCESSING': return 'secondary';
        case 'PAID':
        case 'FULFILLED':
        case 'DELIVERED': return 'default'; // 'default' often maps to primary or success-like
        case 'REJECTED':
        case 'CANCELLED': return 'destructive';
        default: return 'secondary';
    }
  };

  if (authIsLoading || (isLoading && !ordersData && !error)) {
    return <div className="container mx-auto px-4 py-12 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /> <p className="mt-2 text-sm text-gray-500">Loading your orders...</p></div>;
  }

  if (!isAuthenticated && !authIsLoading) {
    return <div className="container mx-auto px-4 py-12 text-center text-gray-500">Redirecting to sign-in...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertCircleIcon className="mx-auto h-12 w-12 text-red-500 mb-3" />
        <p className="text-lg font-medium text-red-600">Error loading orders</p>
        <p className="text-sm text-gray-500 mt-1 mb-4">{error}</p>
        <Button onClick={() => fetchOrders(currentPage)}>Try Again</Button>
      </div>
    );
  }

  if (!ordersData || ordersData.orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">No Orders Found</h2>
        <p className="text-gray-500 mt-2 mb-6">You haven't placed any orders with us yet.</p>
        <Button asChild size="lg"><Link href="/">Start Shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-gray-800">My Orders</h1>
      <Card className="shadow-lg border">
        <CardContent className="p-0"> {/* Remove padding for full-width table */}
          <div className="overflow-x-auto"> {/* Allow horizontal scroll on small screens */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] sm:w-[120px] px-4 py-3">Order ID</TableHead>
                  <TableHead className="px-4 py-3 min-w-[100px]">Date</TableHead>
                  <TableHead className="text-center px-4 py-3 hidden sm:table-cell">Items</TableHead>
                  <TableHead className="text-right px-4 py-3 min-w-[80px]">Total</TableHead>
                  <TableHead className="px-4 py-3 text-center min-w-[120px]">Order Status</TableHead>
                  <TableHead className="px-4 py-3 text-center hidden md:table-cell min-w-[120px]">Payment</TableHead>
                  <TableHead className="text-right px-4 py-3">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersData.orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium text-primary hover:underline px-4 py-3">
                      <Link href={`/account/orders/${order.id}`} title={order.id}>{order.id.substring(0, 8)}...</Link>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center text-sm text-gray-600 px-4 py-3 hidden sm:table-cell">{order.itemCount}</TableCell>
                    <TableCell className="text-right font-medium text-gray-700 px-4 py-3">₹{order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-center px-4 py-3"><Badge variant={getStatusBadgeVariant(order.order_status)} className="text-xs whitespace-nowrap">{order.order_status || 'N/A'}</Badge></TableCell>
                    <TableCell className="text-center px-4 py-3 hidden md:table-cell"><Badge variant={getStatusBadgeVariant(order.payment_status)} className="text-xs whitespace-nowrap">{order.payment_status || 'N/A'}</Badge></TableCell>
                    <TableCell className="text-right px-4 py-3">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/account/orders/${order.id}`}>Details</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {ordersData.totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="h-9 w-9 p-0"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
          <span className="text-sm text-gray-700">
            Page {ordersData.currentPage} of {ordersData.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= ordersData.totalPages || isLoading}
            className="h-9 w-9 p-0"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
