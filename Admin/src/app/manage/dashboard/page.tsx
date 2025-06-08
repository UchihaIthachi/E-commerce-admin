// src/app/manage/dashboard/page.tsx
"use client"; // Make it a client component to use hooks

import React from 'react';
import { trpc } from '@/lib/providers'; // Adjust path if your trpc instance is exported differently
import { Loader2, AlertTriangle } from 'lucide-react'; // For loading/error icons

// Optional: Create a reusable StatCard component or define inline
interface StatCardProps {
  title: string;
  value: string | number | undefined;
  isLoading: boolean;
  error?: string | null;
  icon?: React.ReactNode; // Optional icon
}

const StatCard: React.FC<StatCardProps> = ({ title, value, isLoading, error, icon }) => {
  return (
    <div className="bg-white p-4 shadow rounded-lg dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</h2>
        {icon && <div className="text-gray-500 dark:text-gray-400">{icon}</div>}
      </div>
      <div className="mt-2">
        {isLoading && (
          <div className="flex items-center justify-center h-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center h-16 text-red-500">
            <AlertTriangle className="h-6 w-6 mb-1" />
            <p className="text-sm text-center">Error: {error}</p>
          </div>
        )}
        {!isLoading && !error && value !== undefined && (
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
        )}
         {!isLoading && !error && value === undefined && ( // Handles case where query succeeds but data is undefined
          <p className="text-3xl font-bold text-gray-900 dark:text-white">-</p>
        )}
      </div>
    </div>
  );
};


export default function DashboardPage() {
  const {
    data: totalOrdersCount,
    isLoading: isLoadingTotalOrders,
    error: totalOrdersError
  } = trpc.adminDashboard.getTotalOrdersCount.useQuery();

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

        <StatCard
          title="Total Orders"
          value={totalOrdersCount}
          isLoading={isLoadingTotalOrders}
          error={totalOrdersError?.message}
          // You can add an icon from lucide-react, e.g., <ShoppingCart className="h-6 w-6" />
        />

        {/* Placeholder for Widget 2 */}
        <div className="bg-white p-4 shadow rounded-lg dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Upcoming Widget</h2>
          <p className="text-gray-600 dark:text-gray-400">Content for another widget...</p>
        </div>

        {/* Add more placeholder widgets or actual widgets as needed */}
        <div className="bg-white p-4 shadow rounded-lg dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Another Widget</h2>
          <p className="text-gray-600 dark:text-gray-400">More dashboard content...</p>
        </div>

      </div>
    </div>
  );
}
