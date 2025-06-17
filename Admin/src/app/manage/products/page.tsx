"use client";

import {columns} from "./components/columns";
import {DataTable} from "./components/data-table";
// import {getClothes} from "@/lib/api/cloth"; // No longer needed
// import {useQuery} from "@tanstack/react-query"; // No longer needed
import { trpc } from "@/lib/providers"; // Import trpc instance
import PageLayout from '@/app/manage/components/PageLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ProductListItem } from "@/server/trpc/routers/admin/productRouter"; // Import type for enabledProducts calculation

function ProductsPage() {
    const {
      data: products, // Renamed from clothes to products
      isLoading,
      error, // Add error handling
    } = trpc.adminProduct.getAll.useQuery(
      undefined, // No input/filters for now, add if needed
      // {staleTime: 5 * 60 * 1000} // Example: 5 minutes stale time
    );

    const enabledProducts = products?.filter((product: ProductListItem) => product.enabled === true).length;

    return (
        <PageLayout title="Products">
            {isLoading && ( // Simplified loading display
                <div className="flex justify-center items-center h-full">
                    <LoadingSpinner size="h-12 w-12" />
                </div>
            )}
            {error && (
                <div className="text-red-500 text-center p-4">
                    Error fetching products: {error.message}
                </div>
            )}
            {!isLoading && !error && products && (
                <DataTable columns={columns} data={products} enabledProductsCount = {enabledProducts || 0}/>
            )}
            {!isLoading && !error && !products && (
                 <div className="text-center p-4">No products found.</div>
            )}
        </PageLayout>
    );
}

export default ProductsPage;
