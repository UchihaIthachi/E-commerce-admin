import { deleteGridItem } from "@/server/infrastructure/repositories/grid-items/delete-grid-item-repository";

type DeleteGridItemCommand = {
  _id: string;
};

export default async function deleteGridItemCommandHandler(
  command: DeleteGridItemCommand
) {
  await deleteGridItem(command._id);
}
