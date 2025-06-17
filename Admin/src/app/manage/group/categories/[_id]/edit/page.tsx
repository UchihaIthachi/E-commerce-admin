"use client";

// import { getCategory } from "@/lib/api/category"; // No longer needed
// import { useQuery } from "@tanstack/react-query"; // No longer needed
import { trpc } from "@/lib/providers"; // Import trpc instance
import EditCategoryForm from "../../components/edit-category-form/edit-category-form";
import { Loader2 } from "lucide-react"; // For loading state

type EditCategoryPageProps = {
  params: { _id: string };
};

function EditCategoryPage({ params: { _id } }: EditCategoryPageProps) {
  const {
    data: category,
    isLoading,
    error,
  } = trpc.adminCategory.getById.useQuery({ _id });

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
