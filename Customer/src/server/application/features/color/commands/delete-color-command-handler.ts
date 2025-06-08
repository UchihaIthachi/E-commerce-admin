import { deleteColor } from "@/server/infrastructure/repositories/attributes/color-repository";

type DeleteColorCommand = {
  _id: string;
};

export default async function deleteCategoryCommandHandler(
  command: DeleteColorCommand
) {
  await deleteColor(command._id);
}
