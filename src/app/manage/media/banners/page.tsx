"use client";

import { trpc } from "@/lib/providers"; // Import trpc instance
import { trpc } from "@/lib/providers"; // Import trpc instance
import { DataTable } from "@/app/manage/media/banners/components/data-table";
import { columns } from "@/app/manage/media/banners/components/columns";
import LoadingSpinner from '@/components/ui/LoadingSpinner'; // Import LoadingSpinner

function BannersPage() {
  const { data: banners, isLoading, error } = trpc.adminBanner.getAll.useQuery();

  return (
    <div>
      <h2 className="pt-6 px-6">Banners</h2>
      <div className="p-4">
        {isLoading && (
          <div className="flex justify-center items-center p-10">
            <LoadingSpinner size="h-12 w-12" />
          </div>
        )}
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
