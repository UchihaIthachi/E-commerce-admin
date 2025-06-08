import { GetColorDTO } from "@/server/application/common/dtos/color";
import { createId } from "@paralleldrive/cuid2";
import groq from "groq";
import { dynamicClient } from "../../clients/sanity";
import ValidationError from "@/server/application/common/errors/validation-error";

type CreateColorParams = {
    name: string;
    hex: string;
  };
type UpdateColorParams = {
    _id: string;
    name: string;
    hex: string;
  };

export const getColors = async () => {
    const query = groq`*[_type == 'color']{_id,name,hex}`;
    const data = GetColorDTO.array().parse(await dynamicClient.fetch(query));
    return data;
  };

export const getColor = async (_id: string) => {
    const query = groq`*[_type == 'color' && _id=="${_id}"]{_id,name,hex}`;
    const data = GetColorDTO.parse((await dynamicClient.fetch(query))[0]);
    return data;
  };
  
  
  
export const createColor = async (params: CreateColorParams) => {
    const { name, hex } = params;
    const doc = {
      _type: "color",
      _id: createId(),
      name,
      hex,
    };
    await dynamicClient.create(doc);
  };

export const findColorByName = async (name: string) => {
    const query = groq`*[_type == 'color' && name=="${name}"]._id`;
    const data = await dynamicClient.fetch(query);
    return data.length > 0;
  };

export const updateColor = async (params: UpdateColorParams) => {
    const { _id, name, hex } = params;
    await dynamicClient.patch(params._id).set({ name, hex }).commit();
  };

export const deleteColor = async (_id: string) => {
    try {
      await dynamicClient.delete(_id);
    } catch (error) {
      throw new ValidationError();
    }
  };
  