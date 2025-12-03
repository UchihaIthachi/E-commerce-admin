import { deleteBanner } from "@/server/infrastructure/repositories/banners/delete-banner-repository";

type DeleteBannerCommand = {
  _id: string;
};

export default async function deleteBannerCommandHandler(
  command: DeleteBannerCommand
) {
  await deleteBanner(command._id);
}
