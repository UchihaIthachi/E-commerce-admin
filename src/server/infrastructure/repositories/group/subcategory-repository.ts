import { createId } from "@paralleldrive/cuid2";
import groq from "groq";
import { dynamicClient } from "../../clients/sanity";
import { GetSubCategoryDTO, GetSubCategoriesDTO} from "@/server/application/common/dtos/subcategory";
import ValidationError from "@/server/application/common/errors/validation-error";
import {AddSubCategoryDTO, UpdateSubCategoryDTO} from "@/server/application/common/dtos/subcategory";
import { z } from 'zod';
import { graphqlClient } from "@/server/infrastructure/clients/graphqlClient"; // Updated client

// type CreateSubCategoryParams = {
//   name: string;
//   slug: string;
//   category: string;
// };

type CreateSubCategoryParams= z.infer<typeof AddSubCategoryDTO>;

export const createSubCategory = async (params: CreateSubCategoryParams) => {
  const { name, slug, category, seo } = params;
  const doc = {
    _type: "subcategory",
    _id: createId(),
    name,
    slug,
    category: {
      _type: "reference",
      _ref: category,
    },
    seo: seo
  };
  await dynamicClient.create(doc);
};

export const getSubCategories = async () => {
  const query = `
    query {
      allSubcategory { 
        _id
        name
        slug {
          current
        }
        category {
          _id
          name
        }
      }
    }
  `;

  try {
    const response = await graphqlClient.request(query);

    if (!response.allSubcategory || response.allSubcategory.length === 0) {
      console.warn("No subcategories found.");
      return [];
    }

    // Transform slug to a flat string
    const transformedData = response.allSubcategory.map((item: any) => ({
      ...item,
      slug: item.slug?.current || "", // Ensure slug is always a string
    }));

    // Validate with Zod schema
    const data = GetSubCategoriesDTO.array().parse(transformedData);
    return data;
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    throw new Error("Failed to fetch subcategories");
  }
};

export const getSubCategory = async (_id: string) => {
  const query = `
    query($id: ID!) {
      Subcategory(id: $id) { 
        _id
        name
        slug {
          current
        }
        category {
          _id
          name
        }
        seo {
          title
          description
        }
      }
    }
  `;

  try {
    const variables = { id: _id };
    const response = await graphqlClient.request(query, variables);

    if (!response.Subcategory) {
      throw new Error(`Subcategory with ID "${_id}" not found`);
    }

    // Transform slug to a flat string
    const transformedData = {
      ...response.Subcategory,
      slug: response.Subcategory.slug?.current || "", // Ensure slug is always a string
    };

    // Validate with Zod schema
    const data = GetSubCategoryDTO.parse(transformedData);
    return data;
  } catch (error) {
    console.error(`Error fetching subcategory with ID "${_id}":`, error);
    throw new Error("Failed to fetch subcategory");
  }
};




export const findSubCategoryBySlug = async (slug: string) => {
  const query = groq`*[_type == 'subcategory' && slug=="${slug}"]._id`;
  const data = z.string().array().parse(
    await dynamicClient.fetch(query)
  );
  return data.length > 0;
};

export const deleteSubCategory = async (_id: string) => {
  try {
    await dynamicClient.delete(_id);
  } catch (error) {
    throw new ValidationError();
  }
};




// type UpdateSubCategoryParams = {
//   _id: string;
//   name: string;
//   slug: string;
//   category: string;
// };

type UpdateSubCategoryParams= z.infer<typeof UpdateSubCategoryDTO>;

export const updateSubCategory = async (params: UpdateSubCategoryParams) => {
  const { _id, name, slug, category, seo } = params;
  await dynamicClient
    .patch(params._id)
    .set({ name, slug, category: { _type: "reference", _ref: category }, seo:seo })
    .commit();
};
