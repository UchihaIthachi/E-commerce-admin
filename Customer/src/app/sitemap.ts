// Customer/src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { getAllCategories, getAllActiveProductsForSitemap } from '@/lib/sanity/client';
import type { Category, SitemapProduct } from '@/lib/sanity/client'; // Ensure Category type can have _updatedAt

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily', // Homepage might change more frequently
      priority: 1,
    },
    {
      url: `${BASE_URL}/sign-in`,
      lastModified: new Date(), // Assuming these don't change often
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // Add other important static pages (e.g., /about-us, /contact) here
  ];

  // Fetch categories
  const categories = await getAllCategories();
  const categoryUrls: MetadataRoute.Sitemap = categories
    .filter(category => category?.slug?.current) // Ensure slug exists
    .map((category) => ({
      url: `${BASE_URL}/category/${category.slug.current}`,
      lastModified: category._updatedAt ? new Date(category._updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  // Fetch products
  const products = await getAllActiveProductsForSitemap();
  const productUrls: MetadataRoute.Sitemap = products
    .filter(product => product?.slug?.current) // Ensure slug exists
    .map((product) => ({
      url: `${BASE_URL}/product/${product.slug.current}`,
      lastModified: new Date(product._updatedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  return [
    ...staticPages,
    ...categoryUrls,
    ...productUrls,
  ];
}
