"use client";

import EditBannerForm from "@/app/manage/media/banners/components/edit-banner-form/edit-banner-form";
import { trpc } from "@/lib/providers"; // Import trpc instance

type EditBannerPageProps = {
  params: { _id: string };
};

function EditBannerPage({ params: { _id } }: EditBannerPageProps) {
  const { data: banner, isLoading, error } = trpc.adminBanner.getById.useQuery({ _id });

  return (
    <div>
      <h2 className="p-2 text-lg font-semibold">Edit Banner</h2>
      <div className="p-4">
        {isLoading && <p>Loading...</p>}
        {error && <p>Error fetching banner: {error.message}</p>}
        {!isLoading && !error && banner && <EditBannerForm banner={banner} />}
        {!isLoading && !error && !banner && <p>Banner not found.</p>}
      </div>
    </div>
  );
}

export default EditBannerPage;