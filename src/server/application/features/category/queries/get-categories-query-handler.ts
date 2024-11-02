import { getCategories } from "@/server/infrastructure/repositories/group/category-repository";

export default async function getCategoriesQueryHandler() {
  return await getCategories();
}
