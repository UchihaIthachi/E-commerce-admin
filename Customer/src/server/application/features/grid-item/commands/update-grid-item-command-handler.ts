import {updateGridItem} from "@/server/infrastructure/repositories/grid-items/grid_item-repository";

type UpdateGridItemCommand = {
    _id: string;
    index: number;
    name: string;
    image: string;
    link: string;
}

export default async function updateGridItemCommandHandler(
    command: UpdateGridItemCommand
) {
    await updateGridItem({...command});
}
