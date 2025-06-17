// Customer/src/lib/sanity/client.ts
import { createClient, type SanityClient } from '@sanity/client';
// For image types if needed later, e.g., for image URL builder functions
// import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Import GraphQL queries
import {
  GET_PRODUCT_BY_SLUG_QUERY,
  GET_PRODUCTS_BY_CATEGORY_SLUG_QUERY,
  GET_FEATURED_PRODUCTS_QUERY,
  GET_ALL_CATEGORIES_QUERY,
  GET_CATEGORY_BY_SLUG_QUERY,
  GET_ALL_SUBCATEGORIES_QUERY,
  GET_ALL_ACTIVE_PRODUCTS_FOR_SITEMAP_QUERY,
  SEARCH_PRODUCTS_QUERY, // Added import
  GET_ALL_BANNERS_QUERY,
} from './queries';

// --- TypeScript Interfaces (Basic versions based on queries) ---

export interface SanitySlug {
  current: string;
  _type: 'slug';
}

export interface SanityAssetReference {
  _id: string;
  url: string;
  metadata?: {
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

export interface SanityImageObject {
  asset: SanityAssetReference;
  alt?: string;
}

// Basic Portable Text types - can be expanded
export interface SanityPortableTextSpan {
  _key: string;
  _type: 'span';
  marks?: string[];
  text: string;
}

export interface SanityPortableTextBlockGeneric { // More generic to allow for custom block types if any
  _key: string;
  _type: string; // 'block' or other custom types
  children?: SanityPortableTextSpan[]; // Optional for non-block types like image
  markDefs?: any[];
  style?: string;
  // Allow other properties for custom block types like image within portable text
  [key: string]: any;
}

export type SanityPortableText = SanityPortableTextBlockGeneric[];


export interface Category {
  _id: string;
  name: string;
  slug: SanitySlug;
  description?: SanityPortableText;
  seo?: {
    title?: string;
    description?: string;
    og_image?: SanityImageObject;
  };
  _updatedAt?: string; // Added for sitemap
}

export interface Subcategory {
  _id: string;
  name: string;
  slug: SanitySlug;
  category?: Category;
}

export interface ProductVariant {
  _key: string;
  name: string;
  sku?: string;
  price?: number;
  salePrice?: number;
  stockQuantity: number;
  image?: SanityImageObject;
  color?: string;
  size?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
}

export interface Product {
  _id: string;
  name: string;
  slug: SanitySlug;
  descriptionRaw: SanityPortableText;
  excerpt?: string;
  sku?: string;
  price: number;
  salePrice?: number;
  isFeatured?: boolean;
  mainImage: SanityImageObject;
  additionalImages?: SanityImageObject[];
  categories?: Category[];
  subcategories?: Subcategory[];
  status?: string;
  stockQuantity?: number;
  brand?: string;
  tags?: string[];
  variants?: ProductVariant[];
  seo?: {
    title?: string;
    description?: string;
    og_image?: SanityImageObject;
  };
}

export interface SitemapProduct {
  slug: SanitySlug;
  _updatedAt: string;
}

export interface SanityBanner {
  _id: string;
  name?: string;
  desktop_image?: string;
  mobile_image?: string;
}

// --- Sanity Client Configuration ---
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || 'v2024-05-01';

if (!projectId || !dataset) {
  console.error('Sanity projectId and/or dataset is not defined. Check your environment variables: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET');
  // Depending on how this client is used, you might throw an error or return a dummy client
  // For now, let client creation proceed, it will fail on actual use if not configured.
}

// Client for fetching published content
export const sanityClient: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion: apiVersion,
  useCdn: process.env.NODE_ENV === 'production', // Use CDN in production
  // token: process.env.SANITY_API_READ_TOKEN, // Optional: if you have a read token for published data
  // perspective: 'published', // Default is 'published', can be 'raw' or 'previewDrafts' with token
});

// --- Data Fetching Functions ---

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!projectId || !dataset) return null; // Don't attempt fetch if client not configured
  try {
    const result = await sanityClient.fetch<{ allProduct: Product[] }>(
      GET_PRODUCT_BY_SLUG_QUERY,
      { slug }
    );
    return result?.allProduct?.[0] || null;
  } catch (error) {
    console.error(`Error fetching product by slug "${slug}":`, error);
    return null;
  }
}

export async function getProductsByCategorySlug(
  categorySlug: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ products: Product[]; categoryDetails: Category | null } | null> {
  if (!projectId || !dataset) return null;
  try {
    const result = await sanityClient.fetch<{
      productsInCategory: Product[];
      categoryDetails: Category[];
    }>(GET_PRODUCTS_BY_CATEGORY_SLUG_QUERY, { categorySlug, limit, offset });

    return {
      products: result?.productsInCategory || [],
      categoryDetails: result?.categoryDetails?.[0] || null,
    };
  } catch (error) {
    console.error(`Error fetching products for category slug "${categorySlug}":`, error);
    return null;
  }
}

export async function getFeaturedProducts(limit: number = 4): Promise<Product[]> {
  if (!projectId || !dataset) return [];
  try {
    const result = await sanityClient.fetch<{ allProduct: Product[] }>(
      GET_FEATURED_PRODUCTS_QUERY,
      { limit }
    );
    return result?.allProduct || [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

export async function getAllBanners(): Promise<SanityBanner[]> {
  if (!projectId || !dataset) {
    console.error("Sanity client not configured for getAllBanners.");
    return [];
  }
  try {
    // Ensure GET_ALL_BANNERS_QUERY is imported if not already
    const result = await sanityClient.fetch<{ allBanner: SanityBanner[] }>(
      GET_ALL_BANNERS_QUERY // Make sure this query is defined and imported
    );
    return result?.allBanner || [];
  } catch (error) {
    console.error('Error fetching all banners:', error);
    return [];
  }
}

/**
 * Searches for products based on a query string.
 * Targets product name and excerpt.
 */
export async function searchProducts(query: string, limit: number = 20): Promise<Product[]> {
  if (!projectId || !dataset || !query.trim()) return [];
  try {
    // Try with GraphQL first
    const result = await sanityClient.fetch<{ allProduct: Product[] }>(
      SEARCH_PRODUCTS_QUERY,
      { query: `*${query}*`, limit } // Using wildcards for broader match; specific syntax might vary
    );
    let products = result?.allProduct || [];

    // Fallback or alternative: If GraphQL is not effective, especially for tags or more complex full-text,
    // a GROQ query could be used here. This is a more advanced step.
    // Example GROQ (not implemented in this step, just for illustration):
    // if (products.length === 0) { // Or if specific criteria aren't met by GraphQL
    //   const groqQuery = `*[_type == "product" && status == "active" && (name match $query || excerpt match $query || brand match $query || $query in tags)][0...$limit]{
    //     _id, name, "slug": slug.current, price, salePrice, excerpt, "mainImage": mainImage{asset->{_id, url, metadata{dimensions{width,height}}}, alt},
    //     "categories": categories[]->{_id, name, "slug": slug.current}
    //   }`;
    //   const groqResult = await sanityClient.fetch<Product[]>(groqQuery, { query: `*${query}*`, limit });
    //   products = groqResult || [];
    // }

    return products;
  } catch (error) {
    console.error(`Error searching products for query "${query}":`, error);
    return [];
  }
}

export async function getAllCategories(): Promise<Category[]> {
  if (!projectId || !dataset) return [];
  try {
    const result = await sanityClient.fetch<{ allCategory: Category[] }>(GET_ALL_CATEGORIES_QUERY);
    return result?.allCategory || [];
  } catch (error) {
    console.error('Error fetching all categories:', error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!projectId || !dataset) return null;
  try {
    const result = await sanityClient.fetch<{ allCategory: Category[] }>(
      GET_CATEGORY_BY_SLUG_QUERY,
      { slug }
    );
    return result?.allCategory?.[0] || null;
  } catch (error) {
    console.error(`Error fetching category by slug "${slug}":`, error);
    return null;
  }
}

export async function getAllSubcategories(): Promise<Subcategory[]> {
    if (!projectId || !dataset) return [];
    try {
        const result = await sanityClient.fetch<{ allSubcategory: Subcategory[] }>(GET_ALL_SUBCATEGORIES_QUERY);
        return result?.allSubcategory || [];
    } catch (error) {
        console.error('Error fetching all subcategories:', error);
        return [];
    }
}

export async function getAllActiveProductsForSitemap(): Promise<SitemapProduct[]> {
  if (!projectId || !dataset) return [];
  try {
    const result = await sanityClient.fetch<{ allProduct: SitemapProduct[] }>(
      GET_ALL_ACTIVE_PRODUCTS_FOR_SITEMAP_QUERY
    );
    return result?.allProduct || [];
  } catch (error) {
    console.error('Error fetching all active products for sitemap:', error);
    return [];
  }
}
