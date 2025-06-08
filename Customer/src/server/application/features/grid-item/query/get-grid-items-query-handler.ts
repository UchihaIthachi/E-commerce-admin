import {getGridItems} from "@/server/infrastructure/repositories/grid-items/grid_item-repository";

export default async function getGridItemsQueryHandler() {
    return await getGridItems();
}
