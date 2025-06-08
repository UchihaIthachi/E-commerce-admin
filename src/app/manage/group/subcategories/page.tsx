"use client";

import { getSubCategories } from "@/lib/api/subcategory";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { useQuery } from "@tanstack/react-query";

function CategoriesPage() {
  const { data: subcategories, isLoading } = useQuery({
    queryKey: ["SUBCATEGORY"],
    queryFn: getSubCategories,
  });

  
  return (
    <div>
      <h2 className="pt-6 px-6">Subcategories</h2>
      <div className="p-4">
        {isLoading ? (
          "Loading..."
        ) : (
          <DataTable columns={columns} data={subcategories!} />
        )}
      </div>
    </div>
  );
}

export default CategoriesPage;
