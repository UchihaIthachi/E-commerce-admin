"use client";

import EditSizeForm from "./components/edit-size-form";
import { trpc } from "@/lib/providers"; // Import trpc instance
import { Loader2 } from "lucide-react"; // For loading state

type EditSizePageProps = {
  params: { _id: string };
};

function EditSizePage({ params: { _id } }: EditSizePageProps) {
  const { data: size, isLoading, error } = trpc.adminSize.getById.useQuery({ _id });

  return (
    <div>
      <h2 className="p-2 text-lg font-semibold">Edit Size</h2>
      <div className="p-4">
        {isLoading && (
          <div className="flex items-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading size data...</span>
          </div>
        )}
        {error && <p className="text-red-500">Error fetching size: {error.message}</p>}
        {!isLoading && !error && size && <EditSizeForm size={size} />}
        {!isLoading && !error && !size && <p>Size not found.</p>}
      </div>
    </div>
  );
}

export default EditSizePage;
