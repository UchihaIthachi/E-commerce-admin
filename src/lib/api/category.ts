import {
  AddCategoryDTO,
  EditCategoryDTO,
  GetCategoryDTO,
  GetCategoriesDTO
} from "@/server/application/common/dtos/category";
import api from "./base";
import { z } from "zod";

export const getCategories = async () => {
  const res = await api.get("/api/group/categories");
  const data =  GetCategoriesDTO.array().parse(await res.json());
  return data;
};

export const getCategory = async (_id: string) => {
  const res = await api.get(`/api/group/categories/${_id}`);
  const data = GetCategoryDTO.parse(await res.json());
  console.log(data)
  return data;
};

export const addCategory = async ({
  name,
  slug,
  seo
}: z.infer<typeof AddCategoryDTO>) => {
  await api.post("/api/group/categories", { json: { name, slug, seo } });
};

export const updateCategory = async ({
  _id,
  name,
  slug,
  seo
}: z.infer<typeof EditCategoryDTO> & { _id: string }) => {
  await api.patch(`/api/group/categories/${_id}`, { json: { name, slug, seo } });
};

export const deleteCategory = async ({ _id }: { _id: string }) => {
  await api.delete(`/api/group/categories/${_id}`);
};
