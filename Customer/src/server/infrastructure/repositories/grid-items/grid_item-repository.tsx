import groq from "groq";
import {dynamicClient} from "@/server/infrastructure/clients/sanity";
import {GetGridItemDTO} from "@/server/application/common/dtos/grid-item";
import {GetBannerDTO} from "@/server/application/common/dtos/banner";
import {createId} from "@paralleldrive/cuid2";

export const getGridItems = async () => {
    const query = groq`*[_type == "grid_item"] {_id,index,name,image,link}`;
    const data = GetGridItemDTO.array().parse(await dynamicClient.fetch(query));
    return data
}

export const getGridItem = async (_id: string) => {
    const query = groq`*[_type == "grid_item" && _id=="${_id}"] {_id,index,name,image,link}`;
    const data = GetGridItemDTO.parse((await dynamicClient.fetch(query))[0]);
    return data
}

type CreateGridItemParams = {
    index: number;
    name: string;
    image: string;
    link: string;
}
export const createGridItem = async (params: CreateGridItemParams) => {
    const {index, name, image, link} = params;
    const doc = {
        _type: "grid_item",
        _id: createId(),
        index,
        name,
        image,
        link
    };
    await dynamicClient.create(doc);
};

type UpdateGridItemParams = {
    _id: string;
    index: number;
    name: string;
    image: string;
    link: string;
}
export const updateGridItem = async (params: UpdateGridItemParams) => {
    const {_id, index, name, image, link} = params;
    await dynamicClient.patch(_id).set({index, name, image, link}).commit();
};