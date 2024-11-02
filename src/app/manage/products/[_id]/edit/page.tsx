"use client";

import EditProductForm from "@/app/manage/products/[_id]/edit/components/edit-product-form/edit-product-form";
import {useQuery} from "@tanstack/react-query";
import {getClothById} from "@/lib/api/cloth";

type EditProductPageProps = {
    params: { _id: string }
};

export default function EditProductPage({params: {_id}}: EditProductPageProps) {

    const {data: cloth, isLoading} = useQuery({
        queryKey: ["CLOTH", _id],
        queryFn: () => getClothById(_id),
    });

    return (
        <div>
            <h2 className="p-2">Edit Product</h2>
            <div className="p-4">
                {isLoading ? (
                    "Loading..."
                ) : (
                    <EditProductForm cloth={cloth!}/>
                )}
            </div>
        </div>
    );
};