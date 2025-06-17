"use client";

import EditProductForm from "@/app/manage/products/[_id]/edit/components/edit-product-form/edit-product-form";
// import {useQuery} from "@tanstack/react-query"; // No longer needed
// import {getClothById} from "@/lib/api/cloth"; // No longer needed
import { trpc } from "@/lib/providers"; // Import trpc instance
import { Loader2 } from "lucide-react"; // For loading state

type EditProductPageProps = {
    params: { _id: string }
};

export default function EditProductPage({params: {_id}}: EditProductPageProps) {

    const {
      data: product, // Renamed from cloth to product
      isLoading,
      error, // Add error handling
    } = trpc.adminProduct.getById.useQuery({ _id });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2">Loading product data...</p>
            </div>
        );
    }

    if (error || !product) {
        return <p>Error loading product or product not found.</p>;
    }

    return (
        <div>
            <h2 className="p-2">Edit Product</h2>
            <div className="p-4">
                <EditProductForm product={product}/> {/* Pass product (previously cloth) */}
            </div>
        </div>
    );
};