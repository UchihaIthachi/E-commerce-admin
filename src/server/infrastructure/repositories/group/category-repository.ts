import { GetCategoryDTO, GetCategoriesDTO } from "@/server/application/common/dtos/category";
import { createId } from "@paralleldrive/cuid2";
import groq from "groq";
import { dynamicClient } from "../../clients/sanity";
import ValidationError from "@/server/application/common/errors/validation-error";
import {AddCategoryDTO, UpdateCategoryDTO} from "@/server/application/common/dtos/category";
import { z } from 'zod'

// type CreateCategoryParams = {
//   name: string;
//   slug: string;
// };
type CreateCategoryParams= z.infer<typeof AddCategoryDTO>;


export const createCategory = async (params: CreateCategoryParams) => {
  const { name, slug, seo} = params;
  const doc = {
    _type: "category",
    _id: createId(),
    name,
    slug,
    seo: seo
  };
  await dynamicClient.create(doc);
};

export const getCategories = async () => {
  const query = groq`*[_type == 'category']{_id,name,slug}`;
  const data = GetCategoriesDTO.array().parse(await dynamicClient.fetch(query));
  return data;
};

export const getCategory = async (_id: string) => {
  const query = groq`*[_type == 'category' && _id=="${_id}"]{_id,name,slug, seo}`;
  const data = GetCategoryDTO.parse((await dynamicClient.fetch(query))[0]);
  return data;
};

export const findCategoryBySlug = async (slug: string) => {
  const query = groq`*[_type == 'category' && slug=="${slug}"]._id`;
  const data = await dynamicClient.fetch(query);
  return data.length > 0;
};

type UpdateCategoryParams= z.infer<typeof UpdateCategoryDTO>;

export const updateCategory = async (params: UpdateCategoryParams) => {
  const { _id ,name, slug, seo} = params;
  await dynamicClient.patch(_id).set({ name, slug, seo: seo }).commit();
};

export const deleteCategory = async (_id: string) => {
  try {
    await dynamicClient.delete(_id);
  } catch (error) {
    throw new ValidationError();
  }
};
