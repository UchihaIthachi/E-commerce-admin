import { z } from "zod";

export const GetCategoryDTO = z
  .object({
    _id: z.string(), name: z.string(), slug: z.string(),
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

  export const GetCategoriesDTO = z
  .object({
    _id: z.string(), name: z.string(), slug: z.string(),
  })
  .strict();

export const AddCategoryDTO = z
  .object({
    name: z.string(), slug: z.string(),
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

export const EditCategoryDTO = z
  .object({
    name: z.string(), slug: z.string(),
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

  export const UpdateCategoryDTO = z
  .object({
    _id: z.string(), 
    name: z.string(), slug: z.string(),
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
