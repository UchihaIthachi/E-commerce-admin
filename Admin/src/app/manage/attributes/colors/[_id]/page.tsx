"use client";

import EditColorForm from "./components/edit-color-form";
import { trpc } from "@/lib/providers"; // Import trpc instance
import { Loader2 } from "lucide-react"; // For loading state

type EditColorPageProps = {
  params: { _id: string };
};

function EditColorPage({ params: { _id } }: EditColorPageProps) {
  const { data: color, isLoading, error } = trpc.adminColor.getById.useQuery({ _id });

  return (
    <div>
      <h2 className="p-2 text-lg font-semibold">Edit Color</h2>
      <div className="p-4">
        {isLoading && (
          <div className="flex items-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading color data...</span>
          </div>
        )}
        {error && <p className="text-red-500">Error fetching color: {error.message}</p>}
        {!isLoading && !error && color && <EditColorForm color={color} />}
        {!isLoading && !error && !color && <p>Color not found.</p>}
      </div>
    </div>
  );
}

export default EditColorPage;
