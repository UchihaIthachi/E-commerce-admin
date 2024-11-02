"use client";

import { getColor } from "@/lib/api/color";
import { useQuery } from "@tanstack/react-query";
import EditColorForm from "./components/edit-color-form";

type EditColorPageProps = {
  params: { _id: string };
};

function EditColorPage({ params: { _id } }: EditColorPageProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["COLOR", _id],
    queryFn: () => getColor(_id),
  });

  return (
    <div>
      <h2 className="p-2">Edit Color</h2>
      <div className="p-4">
        {isLoading ? "Loading..." : <EditColorForm color={data!} />}
      </div>
    </div>
  );
}

export default EditColorPage;
