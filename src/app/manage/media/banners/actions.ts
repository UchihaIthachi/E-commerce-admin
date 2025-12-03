"use server";

import deleteBannerCommandHandler from "@/server/application/features/banner/commands/delete-banner-command-handler";
import { revalidatePath } from "next/cache";

export async function deleteBannerAction(formData: FormData) {
  const id = formData.get("_id");
  if (typeof id !== "string") {
     return { message: "Error: Missing ID", errors: { _form: ["Missing ID"] } };
  }

  try {
    await deleteBannerCommandHandler({ _id: id });
    revalidatePath("/manage/media/banners");
    return { message: "Banner deleted successfully" };
  } catch (e: any) {
    return { message: "Failed to delete: " + e.message, errors: { _form: [e.message] } };
  }
}
