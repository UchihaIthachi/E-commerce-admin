"use client";

// import {useQuery} from "@tanstack/react-query"; // No longer needed
// import {getSubCategory} from "@/lib/api/subcategory"; // No longer needed
import { trpc } from "@/lib/providers"; // Import trpc instance
import EditSubCategoryForm from "../../components/edit-category-form/edit-subcategory-form"; // Path seems to contain a typo "edit-category-form" for subcategory
import { Loader2 } from "lucide-react"; // For loading state

type EditSubCategoryPageProps = {
    params: { _id: string };
};

function EditSubCategoryPage({params: {_id}}: EditSubCategoryPageProps) {
    const {
      data: subcategory, // Renamed data to subcategory for clarity
      isLoading,
      error, // Add error handling
    } = trpc.adminSubCategory.getById.useQuery({ _id });

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Loading subcategory data...</p>
        </div>
      );
    }

    if (error || !subcategory) {
      return <p>Error loading subcategory or subcategory not found.</p>;
    }

    return (
        <div>
            <h2 className="p-2">Edit Subcategory</h2>
            <div className="p-4">
                <EditSubCategoryForm subcategory={subcategory}/> {/* Pass loaded subcategory data */}
            </div>
        </div>
    );
}

export default EditSubCategoryPage;
