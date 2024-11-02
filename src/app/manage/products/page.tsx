"use client";

import {columns} from "./components/columns";
import {DataTable} from "./components/data-table";
import {getClothes} from "@/lib/api/cloth";
import {useQuery} from "@tanstack/react-query";

function ProductsPage() {
    const {data: clothes, isLoading} = useQuery({
        queryKey: ["CLOTH"],
        queryFn: getClothes,
    });

    const enabledProducts = clothes?.filter((product: { enabled: boolean; }) => product.enabled == true).length

    return (
        <div>
            <h2 className="p-2">Products</h2>
            <div className="p-4">
                {isLoading ? (
                    "Loading..."
                ) : (
                    <DataTable columns={columns} data={clothes!} enabledProductsCount = {enabledProducts!}/>
                )}
            </div>
        </div>
    );
}

export default ProductsPage;
