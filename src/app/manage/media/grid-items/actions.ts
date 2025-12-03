"use server";

import deleteGridItemCommandHandler from "@/server/application/features/grid-item/commands/delete-grid-item-command-handler";
import { revalidatePath } from "next/cache";

export async function deleteGridItemAction(formData: FormData) {
  const id = formData.get("_id");
  if (typeof id !== "string") {
     return { message: "Error: Missing ID", errors: { _form: ["Missing ID"] } };
  }

  try {
    await deleteGridItemCommandHandler({ _id: id });
    revalidatePath("/manage/media/grid-items");
    return { message: "Grid item deleted successfully" };
  } catch (e: any) {
    return { message: "Failed to delete: " + e.message, errors: { _form: [e.message] } };
  }
}
