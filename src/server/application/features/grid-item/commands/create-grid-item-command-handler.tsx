import {z} from 'zod'
import {AddGridItemDTO} from "@/server/application/common/dtos/grid-item";
import {createGridItem} from "@/server/infrastructure/repositories/grid-items/grid_item-repository";

type CreateGridItemCommandHandler = z.infer<typeof AddGridItemDTO>;

export default async function createGridItemCommandHandler(
    command: CreateGridItemCommandHandler
) {

    await createGridItem({...command});
}
