"use client";

import { getSize } from "@/lib/api/size";
import { useQuery } from "@tanstack/react-query";
import EditSizeForm from "./components/edit-size-form";

type EditSizePageProps = {
  params: { _id: string };
};

function EditSizePage({ params: { _id } }: EditSizePageProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["COLOR", _id],
    queryFn: () => getSize(_id),
  });

  return (
    <div>
      <h2 className="p-2">Edit Size</h2>
      <div className="p-4">
        {isLoading ? "Loading..." : <EditSizeForm size={data!} />}
      </div>
    </div>
  );
}

export default EditSizePage;
