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

// Define DTO for Category with Subcategories
const SubcategoryLiteDTO = z.object({
  _id: z.string(),
  name: z.string().nullable().optional(),
  slug: z.object({ current: z.string() }).nullable().optional(), // Assuming slug object
});

const CategoryWithSubcategoriesDTO = GetCategoryDTO.extend({ // Assuming GetCategoryDTO has _id, name, slug, seo
  subcategories: z.array(SubcategoryLiteDTO).optional().nullable(),
});

export const findCategoryBySlug = async (slug: string): Promise<z.infer<typeof CategoryWithSubcategoriesDTO> | null> => {
  const query = `
    query FindCategoryBySlug($slug: String!) {
      allCategory(where: { slug: { current: { eq: $slug } } }, limit: 1) {
        _id
        name
        slug {
          current
        }
        seo {
          title
          description
        }
        # Assuming 'subcategories' is a reference field in Sanity linking to subcategory documents
        # The name of this field in GraphQL might differ based on your Sanity schema
        # This example assumes a field like 'associatedSubcategories' or similar that resolves to Subcategory type
        # If subcategories are linked from Subcategory documents to Category (e.g. Subcategory.category->),
        # then you might need to query allSubcategory filtered by this category's _id.
        # For this example, let's assume Category has a direct multi-reference to Subcategories:
        subcategories {
          _id
          name
          slug {
            current
          }
        }
      }
    }
  `;
  const variables = { slug };
  try {
    const response = await graphqlClient.request(query, variables);
    if (response.allCategory && response.allCategory.length > 0) {
      const rawCategory = response.allCategory[0];
      // Transform slug from object to string to match GetCategoryDTO if necessary,
      // or adjust DTO. GetCategoryDTO already handles this transformation in getCategory.
      const transformedCategory = {
        ...rawCategory,
        slug: rawCategory.slug?.current || null,
        // subcategories might already be in the correct shape if SubcategoryLiteDTO matches schema
      };
      return CategoryWithSubcategoriesDTO.parse(transformedCategory);
    }
    return null;
  } catch (error) {
    console.error(`Error fetching category by slug "${slug}":`, error);
    return null;
  }
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
