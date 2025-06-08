import ValidationError from "@/server/application/common/errors/validation-error";
import {
  createColor,
  findColorByName,
} from "@/server/infrastructure/repositories/attributes/color-repository";

type CreateColorCommand = {
  name: string;
  hex: string;
};

export default async function createColorCommandHandler(
  command: CreateColorCommand
) {
  const { name } = command;
  const isDuplicate = await findColorByName(name);
  if (isDuplicate) {
    console.log("Hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
    throw new ValidationError();
  }
  await createColor({ ...command });
}

