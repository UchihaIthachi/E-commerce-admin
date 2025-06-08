import {updateCategory,} from "@/server/infrastructure/repositories/group/category-repository";
import {UpdateCategoryDTO} from "@/server/application/common/dtos/category";
import {z} from 'zod'

type UpdateCategoryCommand= z.infer<typeof UpdateCategoryDTO>;

export default async function updateCategoryCommandHandler(
  command: UpdateCategoryCommand
) {
  await updateCategory({ ...command });
}
