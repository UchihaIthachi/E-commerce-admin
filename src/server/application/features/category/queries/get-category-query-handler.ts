import { getCategory } from "@/server/infrastructure/repositories/group/category-repository";

type GetCategoryQuery = {
  _id: string;
};

export default async function getCategoryQueryHandler(
  command: GetCategoryQuery
) {
  return await getCategory(command._id);
}
