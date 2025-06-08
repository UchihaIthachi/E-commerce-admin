"use client";

import {useQuery} from "@tanstack/react-query";
import {getSubCategory} from "@/lib/api/subcategory";
import EditSubCategoryForm from "../../components/edit-category-form/edit-subcategory-form";

type EditSubCategoryPageProps = {
    params: { _id: string };
};

function EditSubCategoryPage({params: {_id}}: EditSubCategoryPageProps) {
    const {data, isLoading} = useQuery({
        queryKey: ["SUBCATEGORY", _id],
        queryFn: () => getSubCategory(_id),
    });

    return (
        <div>
            <h2 className="p-2">Edit Subcategory</h2>
            <div className="p-4">
                {isLoading ? "Loading..." : <EditSubCategoryForm subcategory={data!}/>}
            </div>
        </div>
    );
}

export default EditSubCategoryPage;
