import api from "./base";
import { z } from "zod";
import {
  AddSubCategoryDTO,
  EditSubCategoryDTO,
  GetSubCategoryDTO,
  GetSubCategoriesDTO
} from "@/server/application/common/dtos/subcategory";
import { EditCategoryDTO } from "@/server/application/common/dtos/category";

export const getSubCategories = async () => {
  const res = await api.get("/api/group/subcategories");
  const data = GetSubCategoriesDTO.array().parse(await res.json());
  return data;
};

export const addSubcategory = async ({
  name,
  slug,
  category,
  seo,
}: z.infer<typeof AddSubCategoryDTO>) => {
  await api.post("/api/group/subcategories", {
    json: { name, slug, category, seo},
  });
};

export const deleteSubCategory = async ({ _id }: { _id: string }) => {
  await api.delete(`/api/group/subcategories/${_id}`);
};

export const getSubCategory = async (_id: string) => {
  const res = await api.get(`/api/group/subcategories/${_id}`);
  const data = GetSubCategoryDTO.parse(await res.json());
  return data;
};

export const updateSubCategory = async ({
  _id,
  name,
  slug,
  category,
  seo
}: z.infer<typeof EditSubCategoryDTO> & { _id: string }) => {
  await api.patch(`/api/group/subcategories/${_id}`, {
    json: { name, slug, category, seo },
  });
};
