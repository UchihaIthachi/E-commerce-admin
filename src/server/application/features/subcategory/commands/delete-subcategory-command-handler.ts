import { deleteSubCategory } from "@/server/infrastructure/repositories/group/subcategory-repository";

type DeleteSubCategoryCommand = {
  _id: string;
};

export default async function deleteSubCategoryCommandHandler(
  command: DeleteSubCategoryCommand
) {
  await deleteSubCategory(command._id);
}
