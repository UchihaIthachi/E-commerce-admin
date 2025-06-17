"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import createGridItemCommandHandler from "@/server/application/features/grid-item/commands/create-grid-item-command-handler.ts";
import updateGridItemCommandHandler from "@/server/application/features/grid-item/commands/update-grid-item-command-handler.ts";
import { AddGridItemDTO as ServerAddGridItemDTO, EditGridItemDTO as ServerEditGridItemDTO } from "@/server/application/common/dtos/grid-item";

// Schema for FormData processing in Server Actions
const GridItemFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50),
  index: z.coerce.number().int("Index must be an integer.").min(0, "Index must be non-negative."), // coerce for FormData
  image: z.string().url("Please provide a valid URL for the image."),
  link: z.string().url("Please provide a valid URL for the link."),
});

export type GridItemFormState = {
  message: string | null;
  errors?: {
    name?: string[];
    index?: string[];
    image?: string[];
    link?: string[];
    _form?: string[];
  };
  type: "success" | "error" | null;
};

export async function createGridItemAction(prevState: GridItemFormState, formData: FormData): Promise<GridItemFormState> {
  const validatedFields = GridItemFormSchema.safeParse({
    name: formData.get("name"),
    index: formData.get("index"),
    image: formData.get("image"),
    link: formData.get("link"),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
      type: "error",
    };
  }

  try {
    await createGridItemCommandHandler(validatedFields.data as z.infer<typeof ServerAddGridItemDTO>);
    revalidatePath("/manage/media/grid-items");
    return { message: "Grid Item created successfully.", type: "success" };
  } catch (error: any) {
    return {
      message: error.message || "Failed to create grid item.",
      type: "error",
      errors: { _form: [error.message] }
    };
  }
}

const UpdateGridItemFormSchema = GridItemFormSchema.extend({
  _id: z.string().min(1, "Grid Item ID is required."),
});

export async function updateGridItemAction(prevState: GridItemFormState, formData: FormData): Promise<GridItemFormState> {
  const validatedFields = UpdateGridItemFormSchema.safeParse({
    _id: formData.get("_id"),
    name: formData.get("name"),
    index: formData.get("index"),
    image: formData.get("image"),
    link: formData.get("link"),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
      type: "error",
    };
  }

  try {
    // The EditGridItemDTO on the server does not include _id in its definition,
    // but the updateGridItemCommandHandler expects it as a top-level prop alongside other DTO fields.
    const commandInput = {
        _id: validatedFields.data._id,
        name: validatedFields.data.name,
        index: validatedFields.data.index,
        image: validatedFields.data.image,
        link: validatedFields.data.link,
    };
    await updateGridItemCommandHandler(commandInput as z.infer<typeof ServerEditGridItemDTO> & { _id: string });
    revalidatePath("/manage/media/grid-items");
    revalidatePath(`/manage/media/grid-items/${validatedFields.data._id}/edit`);
    return { message: "Grid Item updated successfully.", type: "success" };
  } catch (error: any) {
    return {
      message: error.message || "Failed to update grid item.",
      type: "error",
      errors: { _form: [error.message] }
    };
  }
}

// deleteGridItemAction omitted as no deleteGridItemCommandHandler was found.
