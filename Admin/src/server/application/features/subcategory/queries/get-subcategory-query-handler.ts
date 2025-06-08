import { getCategory } from "@/server/infrastructure/repositories/group/category-repository";
import { getSubCategory } from "@/server/infrastructure/repositories/group/subcategory-repository";

type GetSubCategoryQuery = {
  _id: string;
};

export default async function getSubCategoryQueryHandler(
  command: GetSubCategoryQuery
) {
  return await getSubCategory(command._id);
}
