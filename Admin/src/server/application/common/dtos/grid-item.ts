import {z} from "zod";

export const GetGridItemDTO = z.object({
    _id: z.string(),
    index: z.number(),
    name: z.string(),
    image: z.string(),
    link: z.string()
});

export const EditGridItemDTO = z.object({
    index: z.number(),
    name: z.string(),
    image: z.string(),
    link: z.string()
});

export const AddGridItemDTO = z.object({
    index: z.number(),
    name: z.string(),
    image: z.string(),
    link: z.string()
});

