"use client";

import { getCategory } from "@/lib/api/category"; // This might be replaced by tRPC query in future
import { useQuery } from "@tanstack/react-query";
import EditCategoryForm from "../../components/edit-category-form/edit-category-form";
import { Loader2 } from "lucide-react"; // For loading state

type EditCategoryPageProps = {
  params: { _id: string };
};

function EditCategoryPage({ params: { _id } }: EditCategoryPageProps) {
  const { data: category, isLoading, error } = useQuery({ // Data fetching remains for now
    queryKey: ["CATEGORY", _id],
    queryFn: () => getCategory(_id),
    // Consider enabling staleTime or cacheTime if data isn't expected to change while user is on this page
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading category data...</p>
      </div>
    );
  }

  if (error || !category) {
    // Handle error case, e.g., category not found
    return <p>Error loading category or category not found.</p>;
  }

  return (
    <div>
      <h2 className="p-2">Edit Category</h2>
      <div className="p-4">
        <EditCategoryForm category={category} /> {/* Pass loaded category data */}
      </div>
    </div>
  );
}

export default EditCategoryPage;
