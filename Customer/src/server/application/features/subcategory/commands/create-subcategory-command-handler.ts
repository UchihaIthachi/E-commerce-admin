import ValidationError from "@/server/application/common/errors/validation-error";
import { createSubCategory, findSubCategoryBySlug } from "@/server/infrastructure/repositories/group/subcategory-repository";
import {AddSubCategoryDTO} from "@/server/application/common/dtos/subcategory";
import { z } from 'zod'

// type CreateSubCategoryCommand = {
//   name: string;
//   slug: string;
//   category: string;
// };
type CreateSubCategoryCommand= z.infer<typeof AddSubCategoryDTO>;

export default async function createSubCategoryCommandHandler(
  command: CreateSubCategoryCommand
) {
  const { slug } = command;
  const isDuplicate = await findSubCategoryBySlug(slug);
  if (isDuplicate) {
    throw new ValidationError();
  }
  await createSubCategory({ ...command });
}
