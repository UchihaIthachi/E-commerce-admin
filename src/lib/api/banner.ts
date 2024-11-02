import api from "@/lib/api/base";
import {AddBannerDTO, EditBannerDTO, GetBannerDTO} from "@/server/application/common/dtos/banner";
import {z} from "zod";

export const getBanners = async () => {
    const res = await api.get("/api/banners");
    const data = GetBannerDTO.array().parse(await res.json());
    return data;
}

export const getBanner = async (_id: string) => {
    console.log(_id)
    const res = await api.get(`/api/banners/${_id}`);
    const data = GetBannerDTO.parse(await res.json());
    return data;
}

export const addBanner = async ({name, desktop_image, mobile_image}: z.infer<typeof AddBannerDTO>) => {
    console.log({name, desktop_image, mobile_image})
    const res = await api.post("/api/banners", {json: {name, desktop_image, mobile_image}});
}

export const updateBanner = async ({_id, name, desktop_image, mobile_image}: z.infer<typeof EditBannerDTO> & { _id: string }) => {
    const res = await api.patch(`/api/banners/${_id}`, {json: {name, desktop_image, mobile_image}});
}

export const deleteBanner = async ({_id}: { _id: string }) => {
    const res = await api.delete(`/api/banners/${_id}`);
}