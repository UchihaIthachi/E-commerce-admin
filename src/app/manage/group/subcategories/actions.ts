"use server";

import deleteSubCategoryCommandHandler from "@/server/application/features/subcategory/commands/delete-subcategory-command-handler";
import { revalidatePath } from "next/cache";

export async function deleteSubCategoryAction(formData: FormData) {
  const id = formData.get("_id");
  if (typeof id !== "string") {
     return { message: "Error: Missing ID", errors: { _form: ["Missing ID"] } };
  }

  try {
    await deleteSubCategoryCommandHandler({ _id: id });
    revalidatePath("/manage/group/subcategories");
    return { message: "Subcategory deleted successfully" };
  } catch (e: any) {
    return { message: "Failed to delete: " + e.message, errors: { _form: [e.message] } };
  }
}
