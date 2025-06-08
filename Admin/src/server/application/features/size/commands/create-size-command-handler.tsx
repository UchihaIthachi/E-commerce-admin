import ValidationError from "@/server/application/common/errors/validation-error";
import {
  createSize,
  findSizeByName,
} from "@/server/infrastructure/repositories/attributes/size-repository";

type CreateSizeCommand = {
  name: string;
};

export default async function createSizeCommandHandler(
  command: CreateSizeCommand
) {
  const { name } = command;
  const isDuplicate = await findSizeByName(name);
  if (isDuplicate) {
    throw new ValidationError();
  }
  await createSize({ ...command });
}
