import { GetColorDTO } from "@/server/application/common/dtos/color";
import { createId } from "@paralleldrive/cuid2";
import groq from "groq";
import { dynamicClient } from "../../clients/sanity";
import ValidationError from "@/server/application/common/errors/validation-error";
import { graphqlClient } from "@/server/infrastructure/clients/graphqlClient"; // Updated client

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
    const query = `
      query {
        allColor {
          _id
          name
          hex
        }
      }
    `;
  
    try {
      const response = await graphqlClient.request(query);
  
      if (!response.allColor || response.allColor.length === 0) {
        console.warn("No colors found.");
        return [];
      }
  
      // Validate the response using Zod schema
      const data = GetColorDTO.array().parse(response.allColor);
      return data;
    } catch (error) {
      console.error("Error fetching colors:", error);
      throw new Error("Failed to fetch colors");
    }
  };
  
  export const getColor = async (_id: string) => {
    const query = `
      query($id: ID!) {
        Color(id: $id) {
          _id
          name
          hex
        }
      }
    `;
  
    try {
      const variables = { id: _id };
      const response = await graphqlClient.request(query, variables);
  
      if (!response.Color) {
        throw new Error(`Color with ID "${_id}" not found.`);
      }
  
      // Validate the response using Zod schema
      const data = GetColorDTO.parse(response.Color);
      return data;
    } catch (error) {
      console.error(`Error fetching color with ID "${_id}":`, error);
      throw new Error("Failed to fetch color");
    }
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
  