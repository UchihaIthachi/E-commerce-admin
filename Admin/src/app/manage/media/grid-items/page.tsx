"use client";

// import {useQuery} from "@tanstack/react-query"; // No longer needed
// import {getGridItems} from "@/lib/api/grid-item"; // No longer needed
import { trpc } from "@/lib/providers"; // Import trpc instance
import {DataTable} from "@/app/manage/media/grid-items/components/data-table";
import {columns} from "@/app/manage/media/grid-items/components/columns";
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function GridItemsPage() {
  const {
    data: gridItems,
    isLoading,
    error, // Add error handling
  } = trpc.adminGridItem.getAll.useQuery();

    return (
        <div>
            <h2 className="pt-6 px-6">Grid Items</h2>
            <div className="p-4">
                {isLoading && ( // Changed to simple isLoading check
                    <div className="flex justify-center items-center p-10">
                        <LoadingSpinner size="h-12 w-12" />
                    </div>
                )}
                {error && <p>Error fetching grid items: {error.message}</p>}
                {!isLoading && !error && gridItems && ( // Ensure gridItems exist before rendering DataTable
                    <DataTable columns={columns} data={gridItems}/>
                )}
                {!isLoading && !error && !gridItems && <p>No grid items found.</p>}
            </div>
        </div>
    );
}

export default GridItemsPage;
