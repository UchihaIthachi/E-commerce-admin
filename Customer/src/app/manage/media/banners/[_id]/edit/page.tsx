"use client";

import {useQuery} from "@tanstack/react-query";
import {getBanner} from "@/lib/api/banner";
import EditBannerForm from "@/app/manage/media/banners/components/edit-banner-form/edit-banner-form";

type EditBannerPageProps = {
    params: { _id: string };
};

function EditCategoryPage({params:{_id}}: EditBannerPageProps) {

    const {data, isLoading} = useQuery({
        queryKey: ["BANNER", _id],
        queryFn: () => getBanner(_id),
    });

    return (
        <div>
            <h2 className="p-2">Edit Banner</h2>
            <div className="p-4">
                {isLoading ? "Loading..." : <EditBannerForm banner={data!}/>}
            </div>
        </div>
    );
}

export default EditCategoryPage;