"use client";

import { getCategory } from "@/lib/api/category";
import { useQuery } from "@tanstack/react-query";
import EditCategoryForm from "../../components/edit-category-form/edit-category-form";

type EditCategoryPageProps = {
  params: { _id: string };
};

function EditCategoryPage({ params: { _id } }: EditCategoryPageProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["CATEGORY", _id],
    queryFn: () => getCategory(_id),
  });

  return (
    <div>
      <h2 className="p-2">Edit Category</h2>
      <div className="p-4">
        {isLoading ? "Loading..." : <EditCategoryForm category={data!} />}
      </div>
    </div>
  );
}

export default EditCategoryPage;
