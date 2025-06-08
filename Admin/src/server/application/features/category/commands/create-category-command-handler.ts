import ValidationError from "@/server/application/common/errors/validation-error";
import {
    createCategory,
    findCategoryBySlug,
} from "@/server/infrastructure/repositories/group/category-repository";
import {AddCategoryDTO} from "@/server/application/common/dtos/category";
import {z} from 'zod'

type CreateCategoryCommand = z.infer<typeof AddCategoryDTO>;

export default async function createCategoryCommandHandler(
    command: CreateCategoryCommand
) {
    const {slug} = command;
    const isDuplicate = await findCategoryBySlug(slug);
    if (isDuplicate) {
        throw new ValidationError();
    }
    await createCategory({...command});
}
