import { z } from "zod";

export const GetSubCategoryDTO = z
  .object({
    _id: z.string(),
    name: z.string(),
    slug: z.string(),
    category: z.object({ _id: z.string(), name: z.string() }),
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

  
export const GetSubCategoriesDTO = z
.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  category: z.object({ _id: z.string(), name: z.string() }),
})
.strict();

export const AddSubCategoryDTO = z
  .object({
    name: z.string(),
    slug: z.string(),
    category: z.string(),
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

export const EditSubCategoryDTO = z
  .object({
    name: z.string(),
    slug: z.string(),
    category: z.string(),
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

  export const UpdateSubCategoryDTO = z
  .object({
    _id: z.string(),
    name: z.string(),
    slug: z.string(),
    category: z.string(),
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
