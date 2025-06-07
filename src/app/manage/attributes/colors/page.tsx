"use client";

import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { trpc } from "@/lib/providers"; // Import trpc instance
import { Loader2 } from "lucide-react"; // For loading state

function ColorsPage() {
  const { data: colors, isLoading, error } = trpc.adminColor.getAll.useQuery();

  return (
    <div>
      <h2 className="p-2 text-lg font-semibold">Colors</h2>
      <div className="p-4 mx-auto">
        {isLoading && (
          <div className="flex items-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading colors...</span>
          </div>
        )}
        {error && <p className="text-red-500">Error fetching colors: {error.message}</p>}
        {!isLoading && !error && colors && (
          <DataTable columns={columns} data={colors} />
        )}
        {!isLoading && !error && !colors && <p>No colors found.</p>}
      </div>
    </div>
  );
}

export default ColorsPage;
