"use client";

// import { getCategories } from "@/lib/api/category"; // No longer needed
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
// import { useQuery } from "@tanstack/react-query"; // No longer needed
import { trpc } from "@/lib/providers"; // Import trpc instance
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function CategoriesPage() {
  const {
    data: categories,
    isLoading,
    error, // Add error handling
  } = trpc.adminCategory.getAll.useQuery();

  return (
    <div>
      <h2 className="pt-6 px-6">Categories</h2>
      <div className="p-4">
        {isLoading && ( // Changed to simple isLoading check
          <div className="flex justify-center items-center p-10">
            <LoadingSpinner size="h-12 w-12" />
          </div>
        )}
        {error && <p>Error fetching categories: {error.message}</p>}
        {!isLoading && !error && categories && ( // Ensure categories exist
          <DataTable columns={columns} data={categories} />
        )}
        {!isLoading && !error && !categories && <p>No categories found.</p>}
      </div>
    </div>
  );
}

export default CategoriesPage;
