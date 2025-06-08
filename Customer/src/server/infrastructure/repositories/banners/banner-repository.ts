import groq from "groq";
import {dynamicClient} from "@/server/infrastructure/clients/sanity";
import {GetBannerDTO} from "@/server/application/common/dtos/banner";
import {createId} from "@paralleldrive/cuid2";

export const getBanners = async () => {
    const query = groq`*[_type == "banner"] {_id,name, desktop_image, mobile_image}`;
    const data = GetBannerDTO.array().parse(await dynamicClient.fetch(query));
    return data
}

export const getBanner = async (_id: string) => {
    const query = groq`*[_type == "banner" && _id=="${_id}"] {_id,name, desktop_image, mobile_image}`;
    const data = GetBannerDTO.parse((await dynamicClient.fetch(query))[0]);
    return data
}

type CreateBannerParams = {
    name: string;
    desktop_image: string;
    mobile_image: string;
}
export const createBanner = async (params: CreateBannerParams) => {
    const {name, desktop_image, mobile_image} = params;
    const doc = {
        _type: "banner",
        _id: createId(),
        name,
        desktop_image: desktop_image,
        mobile_image: mobile_image
    };
    await dynamicClient.create(doc);
};

type UpdateBannerParams = {
    _id: string;
    name: string;
    desktop_image: string;
    mobile_image: string;
}

export const updateBanner = async (params: UpdateBannerParams) => {
    const {_id, name, desktop_image, mobile_image} = params;
    await dynamicClient.patch(_id).set({name, desktop_image, mobile_image}).commit();
};