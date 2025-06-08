"use client";

import { getCategories } from "@/lib/api/category";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { useQuery } from "@tanstack/react-query";

function CategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["CATEGORY"],
    queryFn: getCategories,
  });

  return (
    <div>
      <h2 className="pt-6 px-6">Categories</h2>
      <div className="p-4">
        {isLoading ? (
          "Loading..."
        ) : (
          <DataTable columns={columns} data={categories!} />
        )}
      </div>
    </div>
  );
}

export default CategoriesPage;
