"use client";

import {useQuery} from "@tanstack/react-query";
import {getGridItems} from "@/lib/api/grid-item";
import {DataTable} from "@/app/manage/media/grid-items/components/data-table";
import {columns} from "@/app/manage/media/grid-items/components/columns";

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
                    "Loading..."
                ) : (
                    <DataTable columns={columns} data={gridItems!}/>
                )}
            </div>
        </div>
    );
}

export default GridItemsPage;
