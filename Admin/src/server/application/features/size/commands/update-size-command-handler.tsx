import ValidationError from "@/server/application/common/errors/validation-error";
import {
  updateSize,
} from "@/server/infrastructure/repositories/attributes/size-repository";
import { isReferenced } from "@/server/infrastructure/repositories/shared";

type UpdateSizeCommand = {
  _id: string;
  name: string;
};

export default async function updateSizeCommandHandler(
  command: UpdateSizeCommand
) {
  const { _id } = command;  
  await updateSize({ ...command });
}