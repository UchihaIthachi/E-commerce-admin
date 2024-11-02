import ValidationError from "@/server/application/common/errors/validation-error";
import {
  updateColor,
} from "@/server/infrastructure/repositories/attributes/color-repository";
import { isReferenced } from "@/server/infrastructure/repositories/shared";

type UpdateColorCommand = {
  _id: string;
  name: string;
  hex: string;
};

export default async function updateCategoryCommandHandler(
  command: UpdateColorCommand
) {
  const { _id } = command;
  await updateColor({ ...command });
}