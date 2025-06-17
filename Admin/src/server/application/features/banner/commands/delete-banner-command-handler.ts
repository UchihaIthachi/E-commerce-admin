import { deleteBanner } from "@/server/infrastructure/repositories/banners/banner-repository";
import { z } from "zod";

const DeleteBannerCommandSchema = z.object({
  _id: z.string(),
});

type DeleteBannerCommand = z.infer<typeof DeleteBannerCommandSchema>;

export default async function deleteBannerCommandHandler(command: DeleteBannerCommand) {
  DeleteBannerCommandSchema.parse(command); // Validate input
  try {
    await deleteBanner(command._id);
    // console.log(`Banner with ID ${command._id} marked for deletion.`);
    // Add any additional logic here, e.g., logging, events
  } catch (error) {
    // console.error(`Error deleting banner with ID ${command._id}:`, error);
    // Handle or throw error as appropriate for your application's error strategy
    throw error;
  }
}
