"use client";

import {useQuery} from "@tanstack/react-query";
import {getBanners} from "@/lib/api/banner";
import {DataTable} from "@/app/manage/media/banners/components/data-table";
import {columns} from "@/app/manage/media/banners/components/columns";

function BannersPage() {

    const {data: banners, isLoading} = useQuery({
        queryKey: ["BANNER"],
        queryFn: getBanners,
    });

    return (
        <div>
            <h2 className="p-2">Banners</h2>
            <div className="p-4">
                {isLoading ? (
                    "Loading..."
                ) : (
                    <DataTable columns={columns} data={banners!}/>
                )}
            </div>
        </div>
    );
}

export default BannersPage;
