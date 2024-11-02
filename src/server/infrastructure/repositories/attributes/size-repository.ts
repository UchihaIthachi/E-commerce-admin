import { GetSizeDTO } from "@/server/application/common/dtos/size";
import { createId } from "@paralleldrive/cuid2";
import groq from "groq";
import { dynamicClient } from "../../clients/sanity";
import ValidationError from "@/server/application/common/errors/validation-error";

type CreateSizeParams = {
    name: string;
  };
type UpdateSizeParams = {
    _id: string;
    name: string;
  };

export const getSizes = async () => {
    const query = groq`*[_type == 'size']{_id,name}`;
    const data = GetSizeDTO.array().parse(await dynamicClient.fetch(query));
    return data;
  };

export const getSize = async (_id: string) => {
    const query = groq`*[_type == 'size' && _id=="${_id}"]{_id,name}`;
    const data = GetSizeDTO.parse((await dynamicClient.fetch(query))[0]);
    return data;
  };
  
  
  
export const createSize = async (params: CreateSizeParams) => {
    const { name} = params;
    const doc = {
      _type: "size",
      _id: createId(),
      name,
    };
    await dynamicClient.create(doc);
  };

export const findSizeByName = async (name: string) => {
    const query = groq`*[_type == 'size' && name=="${name}"]._id`;
    const data = await dynamicClient.fetch(query);
    return data.length > 0;
  };

export const updateSize = async (params: UpdateSizeParams) => {
    const { _id, name } = params;
    await dynamicClient.patch(params._id).set({ name }).commit();
  };

export const deleteSize = async (_id: string) => {
    try {
      await dynamicClient.delete(_id);
    } catch (error) {
      throw new ValidationError();
    }
  };
  