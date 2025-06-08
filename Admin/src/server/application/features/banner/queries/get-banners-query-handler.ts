import {getBanners} from "@/server/infrastructure/repositories/banners/banner-repository";

export default async function getBannersQueryHandler() {
    return await getBanners();
}
