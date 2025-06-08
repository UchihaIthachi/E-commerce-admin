import {updateSubCategory} from "@/server/infrastructure/repositories/group/subcategory-repository";
import {UpdateSubCategoryDTO} from "@/server/application/common/dtos/subcategory";
import {z} from 'zod'

type UpdateSubCategoryCommand= z.infer<typeof UpdateSubCategoryDTO>;

export default async function updateSubCategoryCommandHandler(
  command: UpdateSubCategoryCommand
) {
  await updateSubCategory({ ...command });
}
