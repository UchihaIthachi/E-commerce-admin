// Customer/src/app/category/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getProductsByCategorySlug } from '@/lib/sanity/client';
import ProductCard from '@/components/product/ProductCard';
import type { Product, Category, SanityPortableText } from '@/lib/sanity/client'; // Import types
import type { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link'; // For pagination

// You might want a PortableText renderer component for the description
// import { PortableText } from '@portabletext/react'; // Example if you set one up

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams?: {
    page?: string;
  };
}

export async function generateMetadata(
  { params }: CategoryPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  // Fetch only category details for metadata, not all products
  const data = await getProductsByCategorySlug(slug, 0); // Fetch 0 products, just category details

  if (!data?.categoryDetails) {
    return {
      title: 'Category Not Found',
      description: 'The category you are looking for does not exist.',
    };
  }

  const category = data.categoryDetails;
  const previousImages = (await parent).openGraph?.images || [];
  const ogImageUrl = category.seo?.og_image?.asset?.url;

  return {
    title: category.seo?.title || category.name || 'Category Page',
    description: category.seo?.description || `Explore products in the ${category.name} category.`,
    openGraph: {
      title: category.seo?.title || category.name,
      description: category.seo?.description || `Explore products in the ${category.name} category.`,
      images: ogImageUrl ? [ogImageUrl, ...previousImages] : previousImages,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const slug = params.slug;
  const page = searchParams?.page ? parseInt(searchParams.page, 10) : 1;
  const productsPerPage = 12; // Example: 12 products per page
  const offset = (page - 1) * productsPerPage;

  const data = await getProductsByCategorySlug(slug, productsPerPage, offset);

  if (!data || !data.categoryDetails) {
    notFound();
  }

  const { products, categoryDetails } = data;

  // A simple check for total pages - for more accurate pagination,
  // the API might need to return total product count for the category.
  const hasMoreProducts = products.length === productsPerPage;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${appUrl}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": categoryDetails.name,
        "item": `${appUrl}/category/${slug}`
      }
    ]
  };

  return (
    <> {/* Root fragment to hold JSON-LD script and page content */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {categoryDetails.name}
        </h1>
        {categoryDetails.description && (
          <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-600">
            {/* Placeholder for Portable Text rendering.
                Install @portabletext/react and create a component if needed.
                For now, this will not render rich text correctly if description is Portable Text.
            */}
            {/* <PortableText value={categoryDetails.description as any} /> */}
             <p className="text-sm">Category description (Portable Text to be implemented if needed).</p>
          </div>
        )}
      </header>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 md:gap-x-6 md:gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">No products found in this category yet.</p>
      )}

      {/* Basic Pagination */}
      <div className="mt-12 flex justify-center space-x-4">
        {page > 1 && (
          <Link href={`/category/${slug}?page=${page - 1}`} className="px-4 py-2 border rounded-md hover:bg-gray-100">
            Previous
          </Link>
        )}
        {hasMoreProducts && (
          <Link href={`/category/${slug}?page=${page + 1}`} className="px-4 py-2 border rounded-md hover:bg-gray-100">
            Next
          </Link>
        )}
      </div>
    </div>
  </>
  );
}

// Optional: generateStaticParams to pre-render category pages
// import { getAllCategories } from '@/lib/sanity/client';
// export async function generateStaticParams() {
//   const categories = await getAllCategories();
//   return categories.map((category) => ({
//     slug: category.slug.current,
//   }));
// }
