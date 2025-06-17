"use client";

// import { getSubCategories } from "@/lib/api/subcategory"; // No longer needed
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
// import { useQuery } from "@tanstack/react-query"; // No longer needed
import { trpc } from "@/lib/providers"; // Import trpc instance
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function SubCategoriesPage() { // Renamed component for clarity
  const {
    data: subcategories,
    isLoading,
    error, // Add error handling
  } = trpc.adminSubCategory.getAll.useQuery();

  
  return (
    <div>
      <h2 className="pt-6 px-6">Subcategories</h2>
      <div className="p-4">
        {isLoading && ( // Changed to simple isLoading check
          <div className="flex justify-center items-center p-10">
            <LoadingSpinner size="h-12 w-12" />
          </div>
        )}
        {error && <p>Error fetching subcategories: {error.message}</p>}
        {!isLoading && !error && subcategories && ( // Ensure subcategories exist
          <DataTable columns={columns} data={subcategories} />
        )}
        {!isLoading && !error && !subcategories && <p>No subcategories found.</p>}
      </div>
    </div>
  );
}

export default SubCategoriesPage; // Renamed component export
