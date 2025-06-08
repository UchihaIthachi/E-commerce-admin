"use client";

import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { trpc } from "@/lib/providers"; // Import trpc instance
import { Loader2 } from "lucide-react"; // For loading state

function SizesPage() {
  const { data: sizes, isLoading, error } = trpc.adminSize.getAll.useQuery();

  return (
    <div>
      <h2 className="pt-6 px-6">Sizes</h2>
      <div className="p-4 mx-auto">
        {isLoading && (
          <div className="flex items-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading sizes...</span>
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
