"use client";

import { trpc } from "@/lib/providers"; // Import trpc instance
import { DataTable } from "@/app/manage/media/banners/components/data-table";
import { columns } from "@/app/manage/media/banners/components/columns";

function BannersPage() {
  const { data: banners, isLoading, error } = trpc.adminBanner.getAll.useQuery();

  return (
    <div>
      <h2 className="p-2">Banners</h2>
      <div className="p-4">
        {isLoading && <p>Loading...</p>}
        {error && <p>Error fetching banners: {error.message}</p>}
        {!isLoading && !error && banners && (
          <DataTable columns={columns} data={banners} />
        )}
        {!isLoading && !error && !banners && <p>No banners found.</p>}
      </div>
    </div>
  );
}

export default BannersPage;
