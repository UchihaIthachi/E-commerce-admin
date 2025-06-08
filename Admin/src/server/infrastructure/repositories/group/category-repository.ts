import {
  GetCategoryDTO,
  GetCategoriesDTO,
} from "@/server/application/common/dtos/category";
import { createId } from "@paralleldrive/cuid2";
import groq from "groq";
import { dynamicClient } from "../../clients/sanity";
import ValidationError from "@/server/application/common/errors/validation-error";
import {
  AddCategoryDTO,
  UpdateCategoryDTO,
} from "@/server/application/common/dtos/category";
import { z } from "zod";
import { graphqlClient } from "@/server/infrastructure/clients/graphqlClient"; // Updated client


// type CreateCategoryParams = {
//   name: string;
//   slug: string;
// };
type CreateCategoryParams = z.infer<typeof AddCategoryDTO>;

export const createCategory = async (params: CreateCategoryParams) => {
  const { name, slug, seo } = params;
  const doc = {
    _type: "category",
    _id: createId(),
    name,
    slug,
    seo: seo,
  };
  await dynamicClient.create(doc);
};

export const getCategories = async () => {
  const query = `
    query {
      allCategory {
        _id
        name
        slug {
          current
        }
      }
    }
  `;

  try {
    const response = await graphqlClient.request(query);

    if (!response.allCategory || response.allCategory.length === 0) {
      console.warn("No categories found.");
      return [];
    }

    // Transform slug to a flat string
    const transformedData = response.allCategory.map((category: any) => ({
      ...category,
      slug: category.slug?.current || null,
    }));

    // Validate with Zod schema
    const data = GetCategoriesDTO.array().parse(transformedData);
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
};

export const getCategory = async (_id: string) => {
  const query = `
    query($id: ID!) {
      Category(id: $id) {
        _id
        name
        slug {
          current
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

    if (!response.Category) {
      throw new Error(`Category with ID "${_id}" not found.`);
    }

    // Transform slug to a flat string
    const transformedData = {
      ...response.Category,
      slug: response.Category.slug?.current || null,
    };

    // Validate with Zod schema
    const data = GetCategoryDTO.parse(transformedData);
    return data;
  } catch (error) {
    console.error(`Error fetching category with ID "${_id}":`, error);
    throw new Error("Failed to fetch category");
  }
};

export const findCategoryBySlug = async (slug: string) => {
  const query = groq`*[_type == 'category' && slug=="${slug}"]._id`;
  const data = await dynamicClient.fetch(query);
  return data.length > 0;
};

type UpdateCategoryParams = z.infer<typeof UpdateCategoryDTO>;

export const updateCategory = async (params: UpdateCategoryParams) => {
  const { _id, name, slug, seo } = params;
  await dynamicClient.patch(_id).set({ name, slug, seo: seo }).commit();
};

export const deleteCategory = async (_id: string) => {
  try {
    await dynamicClient.delete(_id);
  } catch (error) {
    throw new ValidationError();
  }
};
