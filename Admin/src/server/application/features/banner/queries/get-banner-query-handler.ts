import {getCategory} from "@/server/infrastructure/repositories/group/category-repository";
import {getBanner} from "@/server/infrastructure/repositories/banners/banner-repository";

type GetBannerQuery = {
    _id: string;
};

export default async function getBannerQueryHandler(
    command: GetBannerQuery
) {
    return await getBanner(command._id);
}
