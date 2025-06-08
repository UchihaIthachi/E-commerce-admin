import {z} from "zod";

export const AddProductDTO = z
    .object({
        name: z.string(),
        sku: z.string(),
        enabled:z.boolean(),
        description: z.string(),
        price: z.number().int().nonnegative(),
        discount:z.number().int().nonnegative(),
        category: z.string(),
        subcategory: z.string(),
        variants: z
            .object({
                color: z.string(),
                size: z.string(),
                stock: z.number().int().nonnegative(),
            })
            .array()
            .nonempty(),
        media: z
            .object({
                color: z.string(),
                images: z.string().array().nonempty(),
                isDefault: z.boolean(),
            })
            .array()
            .nonempty(),
        seo: z.object({
            title: z.string().max(60).optional(),
            description: z.string().max(160).optional(),
            og_title: z.string().optional(),
            og_description: z.string().optional(),
            og_image: z.object({
                image: z.string().array().optional(),
                width: z.number().optional(),
                height: z.number().optional(),
                alt: z.string().optional(),
            })
        }),
    })
    .strict();

export const GetClothFormDTO = z.object({
    _id: z.string(),
    name: z.string(),
    sku: z.string(),
    enabled:z.boolean(),
    description:z.string(),
    price: z.number(),
    discount:z.number(),
    category: z.string(),
    subcategory: z.string(),
    variants: z
        .object({
            _id: z.string(),
            color: z.string(),
            size: z.string(),
            stock: z.number()
        })
        .array(),
    media: z
        .object({
            _id: z.string(),
            color: z.string(),
            images: z
                .string()
                .array(),
            isDefault: z.boolean(),
        })
        .array(),
    seo: z.object({
        title: z.string().max(60).optional(),
        description: z.string().max(160).optional(),
        og_title: z.string().optional(),
        og_description: z.string().optional(),
        og_image: z.object({
            image: z.string().array().optional(),
            width: z.number().optional(),
            height: z.number().optional(),
            alt: z.string().optional(),
        })
    }),
})

export const EditProductDTO = z
    .object({
        _id:z.string(),
        name: z.string(),
        sku: z.string(),
        enabled:z.boolean(),
        description: z.string(),
        price: z.number().int().nonnegative(),
        discount: z.number().int().nonnegative(),
        category: z.string(),
        subcategory: z.string(),
        variants: z
            .object({
                _id: z.string().optional(),
                color: z.string(),
                size: z.string(),
                stock: z.number().int().nonnegative(),
            })
            .array(),
        media: z
            .object({
                _id: z.string().optional(),
                color: z.string(),
                images: z.string().array().nonempty(),
                isDefault: z.boolean(),
            })
            .array(),
        seo: z.object({
            title: z.string().max(60).optional(),
            description: z.string().max(160).optional(),
            og_title: z.string().optional(),
            og_description: z.string().optional(),
            og_image: z.object({
                image: z.string().array().optional(),
                width: z.number().optional(),
                height: z.number().optional(),
                alt: z.string().optional(),
            })
        }),
    })
    .strict();
