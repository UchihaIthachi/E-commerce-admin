import { createId } from "@paralleldrive/cuid2";
import groq from "groq";
import { dynamicClient } from "../../clients/sanity";
import { GetSubCategoryDTO, GetSubCategoriesDTO} from "@/server/application/common/dtos/subcategory";
import ValidationError from "@/server/application/common/errors/validation-error";
import {AddSubCategoryDTO, UpdateSubCategoryDTO} from "@/server/application/common/dtos/subcategory";
import { z } from 'zod'

// type CreateSubCategoryParams = {
//   name: string;
//   slug: string;
//   category: string;
// };

type CreateSubCategoryParams= z.infer<typeof AddSubCategoryDTO>;

export const createSubCategory = async (params: CreateSubCategoryParams) => {
  const { name, slug, category, seo } = params;
  const doc = {
    _type: "subcategory",
    _id: createId(),
    name,
    slug,
    category: {
      _type: "reference",
      _ref: category,
    },
    seo: seo
  };
  await dynamicClient.create(doc);
};

export const getSubCategories = async () => {
  const query = groq`*[_type == 'subcategory']{_id,name,slug,"category": category->{_id,name}}`;
  const data = GetSubCategoriesDTO.array().parse(await dynamicClient.fetch(query));
  return data;
};

export const findSubCategoryBySlug = async (slug: string) => {
  const query = groq`*[_type == 'subcategory' && slug=="${slug}"]._id`;
  const data = z.string().array().parse(
    await dynamicClient.fetch(query)
  );
  return data.length > 0;
};

export const deleteSubCategory = async (_id: string) => {
  try {
    await dynamicClient.delete(_id);
  } catch (error) {
    throw new ValidationError();
  }
};

export const getSubCategory = async (_id: string) => {
  const query = groq`*[_type == 'subcategory' && _id=="${_id}"]{_id,name,slug,"category": category->{_id,name},seo}`;
  const data = GetSubCategoryDTO.parse((await dynamicClient.fetch(query))[0]);
  return data;
};

// type UpdateSubCategoryParams = {
//   _id: string;
//   name: string;
//   slug: string;
//   category: string;
// };

type UpdateSubCategoryParams= z.infer<typeof UpdateSubCategoryDTO>;

export const updateSubCategory = async (params: UpdateSubCategoryParams) => {
  const { _id, name, slug, category, seo } = params;
  await dynamicClient
    .patch(params._id)
    .set({ name, slug, category: { _type: "reference", _ref: category }, seo:seo })
    .commit();
};
