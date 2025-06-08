import {updateBanner} from "@/server/infrastructure/repositories/banners/banner-repository";

type UpdateBannerCommand = {
    _id: string;
    name: string;
    desktop_image: string;
    mobile_image: string;
}

export default async function updateBannerCommandHandler(
    command: UpdateBannerCommand
) {
    await updateBanner({...command});
}
