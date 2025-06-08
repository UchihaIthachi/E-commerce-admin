"use client";

import {useQuery} from "@tanstack/react-query";
import {getGridItem} from "@/lib/api/grid-item";
import EditGridItemForm from "@/app/manage/media/grid-items/components/edit-grid-item-form/edit-grid-item-form";

type EditBannerPageProps = {
    params: { _id: string };
};

function EditGridItemPage({params: {_id}}: EditBannerPageProps) {

    const {data, isLoading} = useQuery({
        queryKey: ["GRID_ITEM", _id],
        queryFn: () => getGridItem(_id),
    });

    return (
        <div>
            <h2 className="p-2">Edit Grid Item</h2>
            <div className="p-4">
                {isLoading ? "Loading..." : <EditGridItemForm grid_item={data!}/>}
            </div>
        </div>
    );
}

export default EditGridItemPage;