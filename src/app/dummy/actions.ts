"use server";

import { dynamicClient } from "@/server/infrastructure/clients/sanity";
import groq from "groq";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const patchClothes = async () => {
  const data = await dynamicClient.fetch(groq`*[_type == "cloth"]._id`);

  const enabledData = await dynamicClient.fetch(
    groq`*[_type == "cloth" && enabled==true]._id`
  );

  console.log(data.length, enabledData.length);
};
