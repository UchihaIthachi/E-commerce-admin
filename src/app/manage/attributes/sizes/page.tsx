"use client";

import { getSizes } from "@/lib/api/size";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { useQuery } from "@tanstack/react-query";

function SizesPage() {
  const { data: sizes, isLoading } = useQuery({
    queryKey: ["SIZES"],
    queryFn: getSizes,
  });

  return (
    <div>
      <h2 className="p-2">Sizes</h2>
      <div className="p-4 mx-auto">
        {isLoading ? (
          "Loading..."
        ) : (
          <DataTable columns={columns} data={sizes!} />
        )}
      </div>
    </div>
  );
}

export default SizesPage;
