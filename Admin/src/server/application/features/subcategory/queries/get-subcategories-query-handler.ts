import { getSubCategories } from "@/server/infrastructure/repositories/group/subcategory-repository";

export default async function getSubCategoriesQueryHandler() {
  return await getSubCategories();
}
