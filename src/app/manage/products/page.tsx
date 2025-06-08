"use client";

import {columns} from "./components/columns";
import {DataTable} from "./components/data-table";
import {getClothes} from "@/lib/api/cloth";
import {useQuery} from "@tanstack/react-query";
import PageLayout from '@/app/manage/components/PageLayout'; // Import PageLayout

function ProductsPage() {
    const {data: clothes, isLoading} = useQuery({
        queryKey: ["CLOTH"],
        queryFn: getClothes,
    });

    const enabledProducts = clothes?.filter((product: { enabled: boolean; }) => product.enabled == true).length

    // TODO: Implement headerActions for the "Create Cloth" button
    // For now, the button is part of DataTable or its surrounding div,
    // but ideally it moves to PageLayout's headerActions prop.

    return (
        <PageLayout title="Products">
            {isLoading ? (
                <div className="flex justify-center items-center h-full">Loading...</div> // Centered loading
            ) : (
                <DataTable columns={columns} data={clothes!} enabledProductsCount = {enabledProducts!}/>
            )}
        </PageLayout>
    );
}

export default ProductsPage;
