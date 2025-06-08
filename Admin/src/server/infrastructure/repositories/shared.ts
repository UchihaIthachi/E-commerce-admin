import groq from "groq";
import { dynamicClient } from "../clients/sanity";

export const isReferenced = async (_id: string) => {
  const query = groq`*[references("${_id}")]._id`;
  const data = await dynamicClient.fetch(query);
  return data.length > 0;
};
