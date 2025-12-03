import groq from "groq";
import {dynamicClient} from "@/server/infrastructure/clients/sanity";
import {GetBannerDTO} from "@/server/application/common/dtos/banner";
import {createId} from "@paralleldrive/cuid2";
import { graphqlClient } from "@/server/infrastructure/clients/graphqlClient"; // Updated client


export const getBanners = async () => {
    const query = `
      query {
        allBanner {
          _id
          name
          desktop_image
          mobile_image
        }
      }
    `;
  
    try {
      const response: any = await graphqlClient.request(query);
  
      if (!response.allBanner || response.allBanner.length === 0) {
        console.warn("No banners found.");
        return [];
      }
  
      // Validate with Zod schema
      const data = GetBannerDTO.array().parse(response.allBanner);
      return data;
    } catch (error) {
      console.error("Error fetching banners:", error);
      throw new Error("Failed to fetch banners");
    }
  };
  
  export const getBanner = async (_id: string) => {
    const query = `
      query($id: ID!) {
        Banner(id: $id) {
          _id
          name
          desktop_image
          mobile_image
        }
      }
    `;
  
    try {
      const variables = { id: _id };
      const response: any = await graphqlClient.request(query, variables);
  
      if (!response.Banner) {
        throw new Error(`Banner with ID "${_id}" not found.`);
      }
  
      // Validate with Zod schema
      const data = GetBannerDTO.parse(response.Banner);
      return data;
    } catch (error) {
      console.error(`Error fetching banner with ID "${_id}":`, error);
      throw new Error("Failed to fetch banner");
    }
  };
  

type CreateBannerParams = {
    name: string;
    desktop_image: string;
    mobile_image: string;
}
export const createBanner = async (params: CreateBannerParams) => {
    const {name, desktop_image, mobile_image} = params;
    const doc = {
        _type: "banner",
        _id: createId(),
        name,
        desktop_image: desktop_image,
        mobile_image: mobile_image
    };
    await dynamicClient.create(doc);
};

type UpdateBannerParams = {
    _id: string;
    name: string;
    desktop_image: string;
    mobile_image: string;
}

export const updateBanner = async (params: UpdateBannerParams) => {
    const {_id, name, desktop_image, mobile_image} = params;
    await dynamicClient.patch(_id).set({name, desktop_image, mobile_image}).commit();
};