import { deleteCategory } from "@/server/infrastructure/repositories/group/category-repository";

type DeleteCategoryCommand = {
  _id: string;
};

export default async function deleteCategoryCommandHandler(
  command: DeleteCategoryCommand
) {
  await deleteCategory(command._id);
}
