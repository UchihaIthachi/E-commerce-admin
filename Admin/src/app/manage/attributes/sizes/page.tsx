"use client";

import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { trpc } from "@/lib/providers"; // Import trpc instance
// import { Loader2 } from "lucide-react"; // No longer needed directly
import LoadingSpinner from '@/components/ui/LoadingSpinner'; // Import LoadingSpinner

function SizesPage() {
  const { data: sizes, isLoading, error } = trpc.adminSize.getAll.useQuery();

  return (
    <div>
      <h2 className="pt-6 px-6">Sizes</h2>
      <div className="p-4 mx-auto">
        {isLoading && (
          <div className="flex justify-center items-center p-10">
            <LoadingSpinner size="h-12 w-12" />
          </div>
        )}
        {error && <p className="text-red-500">Error fetching sizes: {error.message}</p>}
        {!isLoading && !error && sizes && (
          <DataTable columns={columns} data={sizes} />
        )}
        {!isLoading && !error && !sizes && <p>No sizes found.</p>}
      </div>
    </div>
  );
}

export default SizesPage;
