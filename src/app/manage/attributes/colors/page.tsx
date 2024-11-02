"use client";

import { getColors } from "@/lib/api/color";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { useQuery } from "@tanstack/react-query";

function ColorsPage() {
  const { data: colors, isLoading } = useQuery({
    queryKey: ["COLOR"],
    queryFn: getColors,
  });

  return (
    <div>
      <h2 className="p-2">Colors</h2>
      <div className="p-4 mx-auto">
        {isLoading ? (
          "Loading..."
        ) : (
          <DataTable columns={columns} data={colors!} />
        )}
      </div>
    </div>
  );
}

export default ColorsPage;
