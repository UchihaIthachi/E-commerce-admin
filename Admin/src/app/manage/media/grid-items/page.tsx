"use client";

import {useQuery} from "@tanstack/react-query";
import {getGridItems} from "@/lib/api/grid-item";
import {DataTable} from "@/app/manage/media/grid-items/components/data-table";
import {columns} from "@/app/manage/media/grid-items/components/columns";
import LoadingSpinner from '@/components/ui/LoadingSpinner'; // Import LoadingSpinner

function GridItemsPage() {

    const {data: gridItems, isLoading} = useQuery({
        queryKey: ["GRID_ITEM"],
        queryFn: getGridItems,
    });

    return (
        <div>
            <h2 className="pt-6 px-6">Grid Items</h2>
            <div className="p-4">
                {isLoading ? (
                    <div className="flex justify-center items-center p-10">
                        <LoadingSpinner size="h-12 w-12" />
                    </div>
                ) : (
                    <DataTable columns={columns} data={gridItems!}/>
                )}
            </div>
        </div>
    );
}

export default GridItemsPage;
