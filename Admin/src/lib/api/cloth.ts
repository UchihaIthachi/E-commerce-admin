import { Cloth } from "@/server/application/common/dtos/schemas";
import {
  dynamicClient,
  staticClient,
} from "@/server/infrastructure/clients/sanity";
import groq from "groq";
import { z } from "zod";
import {
  AddProductDTO,
  EditProductDTO,
  GetClothFormDTO,
} from "@/server/application/common/dtos/cloth";
import api from "@/lib/api/base";

export const getClothes = async () => {
  let query = `*[_type == "cloth" ] {_id,name,sku,price,discount,'category':category->name,'subcategory':subcategory->name, enabled}`;
  const data = Cloth.array().parse(await staticClient.fetch(query));
  return data;
};

export const getClothById = async (_id: string) => {
  let query = groq`*[_type == "cloth" && _id == "${_id}"] {_id,enabled,name,sku,description,price,discount,'category':category->_id,'subcategory':subcategory->_id,"variants": *[_type=='variant' && references(^._id)]{_id, "color":color->_id, "size":size->_id, stock}, "media": *[_type=='media' && references(^._id)]{_id, images,"color":color->_id, "isDefault": default}, seo}`;
  const data = GetClothFormDTO.parse((await dynamicClient.fetch(query))[0]);
  console.log(data);
  return data;
};

export const getSubCategoriesForCategory = async (category: string) => {
  const query = groq`*[_type == 'subcategory' && category->_id=="${category}"]{_id,name}`;
  const data = z
    .object({ _id: z.string(), name: z.string() })
    .array()
    .parse(await staticClient.fetch(query));
  return data;
};

export const getColors = async () => {
  const query = groq`*[_type == 'color']{_id,name}`;
  const data = z
    .object({ _id: z.string(), name: z.string() })
    .array()
    .parse(await staticClient.fetch(query));
  return data;
};

export const getSizes = async () => {
  const query = groq`*[_type == 'size']{_id,name}`;
  const data = z
    .object({ _id: z.string(), name: z.string() })
    .array()
    .parse(await staticClient.fetch(query));
  return data;
};
export const addProduct = async (product: z.infer<typeof AddProductDTO>) => {
  const res = await api.post("/api/product", { json: product });
};
export const editProduct = async ({
  _id,
  product,
}: {
  _id: string;
  product: z.infer<typeof EditProductDTO>;
}) => {
  const res = await api.put(`/api/product/${_id}`, { json: product });
};
