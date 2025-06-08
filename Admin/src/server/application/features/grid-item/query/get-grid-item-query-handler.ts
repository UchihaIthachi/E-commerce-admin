import {getGridItem} from "@/server/infrastructure/repositories/grid-items/grid_item-repository";

type GetGridItemQuery = {
    _id: string;
};

export default async function getBannerQueryHandler(
    command: GetGridItemQuery
) {
    return await getGridItem(command._id);
}
