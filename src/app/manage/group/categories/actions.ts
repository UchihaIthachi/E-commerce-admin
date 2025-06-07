// src/app/manage/group/categories/actions.ts
"use server";

import { z } from "zod";
import { AddCategoryDTO, EditCategoryDTO } from "@/server/application/common/dtos/category";
import createCategoryCommandHandler from "@/server/application/features/category/commands/create-category-command-handler";
import updateCategoryCommandHandler from "@/server/application/features/category/commands/update-category-command-handler";
import deleteCategoryCommandHandler from "@/server/application/features/category/commands/delete-category-command-handler";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import ValidationError from "@/server/application/common/errors/validation-error"; // Assuming this exists

// Helper to parse FormData, can be expanded
async function parseAndValidate<T extends z.ZodTypeAny>(dto: T, formData: FormData): Promise<z.infer<T>> {
  const objectData = Object.fromEntries(formData.entries());
  // Basic handling for nested SEO object if not automatically parsed by fromEntries
  if (formData.has('seo.title') || formData.has('seo.description')) {
    objectData.seo = {
      title: formData.get('seo.title') as string,
      description: formData.get('seo.description') as string,
    };
  }
  const validated = dto.safeParse(objectData);
  if (!validated.success) {
    // Convert ZodError to a more user-friendly format or throw custom error
    // For now, just logging and throwing a generic validation error
    console.error("Validation errors:", validated.error.flatten().fieldErrors);
    throw new ValidationError("Validation failed. Please check the form fields.");
  }
  return validated.data;
}


export async function createCategoryAction(
  prevState: { message?: string; errors?: Record<string, string[]> } | null, // For useFormState
  formData: FormData
) {
  try {
    const newCategory = await parseAndValidate(AddCategoryDTO, formData);
    await createCategoryCommandHandler(newCategory);
    revalidatePath("/manage/group/categories");
    // No explicit redirect here, let the form handle success (e.g. by useFormStatus)
    // or redirect can be done from the page calling the action if needed.
    // For now, returning a success state for useFormState
    return { message: "Category created successfully", errors: undefined };
  } catch (e: any) {
    console.error(e);
    if (e instanceof ValidationError || e instanceof z.ZodError) {
        // Simplistic error handling for useFormState example
        // A more robust solution would map Zod errors to field names
        return { message: "Validation Error: " + e.message, errors: (e instanceof z.ZodError ? e.flatten().fieldErrors : { _form: [e.message] }) };
    }
    return { message: "Failed to create category: " + e.message, errors: { _form: [e.message] } };
  }
}

export async function updateCategoryAction(
  prevState: { message?: string; errors?: Record<string, string[]> } | null,
  formData: FormData
) {
  const id = formData.get("_id");
  if (typeof id !== "string") {
    return { message: "Error: Missing category ID for update.", errors: { _form: ["Missing category ID."] } };
  }

  // Use a schema that includes _id for validation if desired, or handle _id separately
  const UpdateCategoryWithIdDTO = EditCategoryDTO.extend({ _id: z.string() });

  try {
    // Create a new FormData that includes the _id for parseAndValidate
    const formDataWithId = new FormData();
    for (const [key, value] of formData.entries()) {
        formDataWithId.append(key, value);
    }
    if (!formDataWithId.has('_id')) { // Ensure _id is present
        formDataWithId.append('_id', id);
    }

    const updatedCategoryData = await parseAndValidate(UpdateCategoryWithIdDTO, formDataWithId);

    // Remove _id from data before passing to command handler if it doesn't expect it
    const { _id, ...dataToUpdate } = updatedCategoryData;

    await updateCategoryCommandHandler({ _id: id, ...dataToUpdate }); // Pass _id explicitly

    revalidatePath("/manage/group/categories");
    revalidatePath(`/manage/group/categories/${id}/edit`); // Revalidate specific edit page
    // For useFormState, return success state
    return { message: "Category updated successfully", errors: undefined };
  } catch (e: any) {
    console.error(e);
     if (e instanceof ValidationError || e instanceof z.ZodError) {
        return { message: "Validation Error: " + e.message, errors: (e instanceof z.ZodError ? e.flatten().fieldErrors : { _form: [e.message] }) };
    }
    return { message: "Failed to update category: " + e.message, errors: { _form: [e.message] } };
  }
}

export async function deleteCategoryAction(
  prevState: { message?: string; errors?: Record<string, string[]> } | null,
  formData: FormData
) {
  const id = formData.get("_id");
  if (typeof id !== "string") {
    return { message: "Error: Missing category ID for deletion.", errors: { _form: ["Missing category ID."] } };
  }

  try {
    await deleteCategoryCommandHandler(id); // Assuming handler takes just id
    revalidatePath("/manage/group/categories");
    // No redirect here, form/page should handle this (e.g. navigate away)
    // For useFormState, return success state
    return { message: "Category deleted successfully", errors: undefined };
  } catch (e: any) {
    console.error(e);
    // It's good to check for specific error types if your command handler throws them
    return { message: "Failed to delete category: " + e.message, errors: { _form: [e.message] } };
  }
}
