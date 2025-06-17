"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import createBannerCommandHandler from "@/server/application/features/banner/commands/create-banner-command-handler.ts"; // Corrected extension
import updateBannerCommandHandler from "@/server/application/features/banner/commands/update-banner-command-handler.ts"; // Corrected extension
import deleteBannerCommandHandler from "@/server/application/features/banner/commands/delete-banner-command-handler"; // Import delete handler

import { AddBannerDTO as ServerAddBannerDTO, EditBannerDTO as ServerEditBannerDTO } from "@/server/application/common/dtos/banner";

// Schema for FormData processing in Server Actions
const BannerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50),
  desktop_image: z.string().url("Please provide a valid URL for the desktop image."),
  mobile_image: z.string().url("Please provide a valid URL for the mobile image."),
});

export type BannerFormState = {
  message: string | null;
  errors?: {
    name?: string[];
    desktop_image?: string[];
    mobile_image?: string[];
    _form?: string[];
  };
  type: "success" | "error" | null;
};

export async function createBannerAction(prevState: BannerFormState, formData: FormData): Promise<BannerFormState> {
  const validatedFields = BannerFormSchema.safeParse({
    name: formData.get("name"),
    desktop_image: formData.get("desktop_image"),
    mobile_image: formData.get("mobile_image"),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
      type: "error",
    };
  }

  try {
    // CRITICAL ASSUMPTION: createBannerCommandHandler must be callable as a plain function.
    // If it's a React component or relies on React context, this will fail.
    await createBannerCommandHandler(validatedFields.data as z.infer<typeof ServerAddBannerDTO>);
    revalidatePath("/manage/media/banners");
    return { message: "Banner created successfully.", type: "success" };
  } catch (error: any) {
    return {
      message: error.message || "Failed to create banner.",
      type: "error",
      errors: { _form: [error.message] }
    };
  }
}

export async function deleteBannerAction(prevState: { message: string | null, type?: string, errors?: any }, formData: FormData): Promise<{ message: string | null, type: string, errors?: any }> {
  const bannerId = formData.get("_id") as string;

  if (!bannerId) {
    return { message: "Banner ID is required.", type: "error" };
  }

  try {
    await deleteBannerCommandHandler({ _id: bannerId });
    revalidatePath("/manage/media/banners");
    return { message: "Banner deleted successfully.", type: "success" };
  } catch (error: any) {
    return { message: error.message || "Failed to delete banner.", type: "error", errors: { _form: [error.message] }};
  }
}

const UpdateBannerFormSchema = BannerFormSchema.extend({
  _id: z.string().min(1, "Banner ID is required."),
});

export async function updateBannerAction(prevState: BannerFormState, formData: FormData): Promise<BannerFormState> {
  const validatedFields = UpdateBannerFormSchema.safeParse({
    _id: formData.get("_id"),
    name: formData.get("name"),
    desktop_image: formData.get("desktop_image"),
    mobile_image: formData.get("mobile_image"),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
      type: "error",
    };
  }

  try {
    // CRITICAL ASSUMPTION: updateBannerCommandHandler must be callable as a plain function.
    await updateBannerCommandHandler(validatedFields.data as z.infer<typeof ServerEditBannerDTO> & { _id: string });
    revalidatePath("/manage/media/banners");
    revalidatePath(`/manage/media/banners/${validatedFields.data._id}/edit`);
    return { message: "Banner updated successfully.", type: "success" };
  } catch (error: any) {
    return {
      message: error.message || "Failed to update banner.",
      type: "error",
      errors: { _form: [error.message] }
    };
  }
}
