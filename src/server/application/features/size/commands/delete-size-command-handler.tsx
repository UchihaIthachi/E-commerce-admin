import { deleteSize } from "@/server/infrastructure/repositories/attributes/size-repository";

type DeleteSizeCommand = {
  _id: string;
};

export default async function deleteCategoryCommandHandler(
  command: DeleteSizeCommand
) {
  await deleteSize(command._id);
}
