import {z} from "zod";

export const GetBannerDTO = z.object({_id: z.string(), name: z.string(), desktop_image: z.string(), mobile_image:z.string()});
export const AddBannerDTO = z.object({name: z.string(), desktop_image: z.string(), mobile_image: z.string()});
export const EditBannerDTO = z.object({name: z.string(), desktop_image: z.string(), mobile_image: z.string()});
