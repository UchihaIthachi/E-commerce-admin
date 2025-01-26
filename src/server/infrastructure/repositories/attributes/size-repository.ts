import { GetSizeDTO } from "@/server/application/common/dtos/size";
import { createId } from "@paralleldrive/cuid2";
import groq from "groq";
import { dynamicClient } from "../../clients/sanity";
import ValidationError from "@/server/application/common/errors/validation-error";
import { graphqlClient } from "@/server/infrastructure/clients/graphqlClient"; // Updated client

type CreateSizeParams = {
    name: string;
  };
type UpdateSizeParams = {
    _id: string;
    name: string;
  };

  export const getSizes = async () => {
    const query = `
      query {
        allSize {
          _id
          name
        }
      }
    `;
  
    try {
      const response = await graphqlClient.request(query);
  
      if (!response.allSize || response.allSize.length === 0) {
        console.warn("No sizes found.");
        return [];
      }
  
      // Validate the response using Zod schema
      const data = GetSizeDTO.array().parse(response.allSize);
      return data;
    } catch (error) {
      console.error("Error fetching sizes:", error);
      throw new Error("Failed to fetch sizes");
    }
  };
  
  export const getSize = async (_id: string) => {
    const query = `
      query($id: ID!) {
        Size(id: $id) {
          _id
          name
        }
      }
    `;
  
    try {
      const variables = { id: _id };
      const response = await graphqlClient.request(query, variables);
  
      if (!response.Size) {
        throw new Error(`Size with ID "${_id}" not found.`);
      }
  
      // Validate the response using Zod schema
      const data = GetSizeDTO.parse(response.Size);
      return data;
    } catch (error) {
      console.error(`Error fetching size with ID "${_id}":`, error);
      throw new Error("Failed to fetch size");
    }
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
  