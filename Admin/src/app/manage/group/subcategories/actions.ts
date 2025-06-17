"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import createSubCategoryCommandHandler from "@/server/application/features/subcategory/commands/create-subcategory-command-handler";
import updateSubCategoryCommandHandler from "@/server/application/features/subcategory/commands/update-subcategory-command-handler";
import deleteSubCategoryCommandHandler from "@/server/application/features/subcategory/commands/delete-subcategory-command-handler";
import { AddSubCategoryDTO as ServerAddSubCategoryDTO, UpdateSubCategoryDTO as ServerUpdateSubCategoryDTO } from "@/server/application/common/dtos/subcategory"; // Use server DTOs

// Simplified DTO for form data processing, matching Category actions pattern
const SubCategoryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50),
  slug: z.string().min(2).max(50)
    .refine((v) => v === v.toLowerCase(), { message: "Slugs can't have capital letters" })
    .refine((v) => !v.includes(" "), { message: "Slugs can't have spaces" }),
  category: z.string({ required_error: "Please select a category." }),
  "seo.title": z.string().max(60).optional().nullable(),
  "seo.description": z.string().max(160).optional().nullable(),
  // OG fields are omitted here for simplicity with FormData, assuming DTOs/handlers are tolerant
});

export type FormState = {
  message: string | null;
  errors?: {
    name?: string[];
    slug?: string[];
    category?: string[];
    "seo.title"?: string[];
    "seo.description"?: string[];
    _form?: string[]; // For general form errors
  };
  type: "success" | "error" | null;
};

export async function createSubcategoryAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = SubCategoryFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    category: formData.get("category"),
    "seo.title": formData.get("seo.title"),
    "seo.description": formData.get("seo.description"),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
      type: "error",
    };
  }

  try {
    // Map to the DTO expected by the command handler
    const commandInput: z.infer<typeof ServerAddSubCategoryDTO> = {
      name: validatedFields.data.name,
      slug: validatedFields.data.slug,
      category: validatedFields.data.category,
      seo: { // Construct the nested SEO object
        title: validatedFields.data["seo.title"] || undefined,
        description: validatedFields.data["seo.description"] || undefined,
        // og_title, og_description, og_image are not handled by this simplified form schema
      },
    };
    await createSubCategoryCommandHandler(commandInput);
    revalidatePath("/manage/group/subcategories");
    // redirect("/manage/group/subcategories"); // Optional: redirect after successful creation
    return { message: "Subcategory created successfully.", type: "success" };
  } catch (error: any) {
    return {
      message: error.message || "Failed to create subcategory.",
      type: "error",
      errors: { _form: [error.message] }
    };
  }
}

const UpdateSubCategoryFormSchema = SubCategoryFormSchema.extend({
  _id: z.string().min(1, "Subcategory ID is required."),
});

export async function updateSubcategoryAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = UpdateSubCategoryFormSchema.safeParse({
    _id: formData.get("_id"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    category: formData.get("category"),
    "seo.title": formData.get("seo.title"),
    "seo.description": formData.get("seo.description"),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
      type: "error",
    };
  }

  try {
    const commandInput: z.infer<typeof ServerUpdateSubCategoryDTO> = {
      _id: validatedFields.data._id,
      name: validatedFields.data.name,
      slug: validatedFields.data.slug,
      category: validatedFields.data.category,
      seo: {
        title: validatedFields.data["seo.title"] || undefined,
        description: validatedFields.data["seo.description"] || undefined,
      },
    };
    await updateSubCategoryCommandHandler(commandInput);
    revalidatePath("/manage/group/subcategories");
    revalidatePath(`/manage/group/subcategories/${validatedFields.data._id}/edit`);
    return { message: "Subcategory updated successfully.", type: "success" };
  } catch (error: any) {
    return {
      message: error.message || "Failed to update subcategory.",
      type: "error",
      errors: { _form: [error.message] }
    };
  }
}

export async function deleteSubcategoryAction(prevState: { message: string | null, type?: string }, formData: FormData): Promise<{ message: string | null, type: string }> {
  const subcategoryId = formData.get("_id") as string;

  if (!subcategoryId) {
    return { message: "Subcategory ID is required.", type: "error" };
  }

  try {
    await deleteSubCategoryCommandHandler({ _id: subcategoryId });
    revalidatePath("/manage/group/subcategories");
    return { message: "Subcategory deleted successfully.", type: "success" };
  } catch (error: any) {
    return { message: error.message || "Failed to delete subcategory.", type: "error" };
  }
}
