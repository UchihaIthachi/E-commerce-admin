import {z} from 'zod'
import {AddBannerDTO} from "@/server/application/common/dtos/banner";
import {createBanner} from "@/server/infrastructure/repositories/banners/banner-repository";

type CreateBannerCommandHandler = z.infer<typeof AddBannerDTO>;

export default async function createBannerCommandHandler(
    command: CreateBannerCommandHandler
) {

    await createBanner({...command});
}
