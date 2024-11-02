import api from "@/lib/api/base";
import {AddBannerDTO, EditBannerDTO, GetBannerDTO} from "@/server/application/common/dtos/banner";
import {AddGridItemDTO, EditGridItemDTO, GetGridItemDTO} from "@/server/application/common/dtos/grid-item";
import {z} from "zod";

export const getGridItems = async () => {
    const res = await api.get("/api/grid-items");
    const data = GetGridItemDTO.array().parse(await res.json());
    return data;
}

export const getGridItem = async (_id: string) => {
    const res = await api.get(`/api/grid-items/${_id}`);
    const data = GetGridItemDTO.parse(await res.json());
    return data;
}

export const addGridItem = async ({index, name, image, link}: z.infer<typeof AddGridItemDTO>) => {
    const res = await api.post("/api/grid-items", {json: {index, name, image, link}});
}

export const updateGridItem = async ({_id, index, name, image, link}: z.infer<typeof EditGridItemDTO> & {
    _id: string
}) => {
    const res = await api.patch(`/api/grid-items/${_id}`, {json: {index, name, image, link}});
}

export const deleteGridItem = async ({_id}: { _id: string }) => {
    const res = await api.delete(`/api/grid-items/${_id}`);
}