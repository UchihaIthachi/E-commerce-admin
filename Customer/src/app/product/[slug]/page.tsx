// Customer/src/app/product/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/sanity/client';
import type { Product, SanityImageObject, ProductVariant, SanityPortableText } from '@/lib/sanity/client'; // Import types
import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { urlForImage } from '@/lib/sanity/image';
import { Button } from '@/components/ui/button'; // Assuming Button from shadcn
import React from 'react'; // Import React for React.Fragment

// For Portable Text - you would need to install @portabletext/react and create components
// import { PortableText, PortableTextComponents } from '@portabletext/react';

// Example (very basic) Portable Text components - create in a separate file e.g., components/ui/PortableTextComponents.tsx
// const customPortableTextComponents: Partial<PortableTextComponents> = {
//   block: {
//     normal: ({children}) => <p className="mb-4 last:mb-0">{children}</p>,
//     h1: ({children}) => <h1 className="text-4xl font-bold my-4">{children}</h1>,
//     h2: ({children}) => <h2 className="text-3xl font-semibold my-3">{children}</h2>,
//     h3: ({children}) => <h3 className="text-2xl font-semibold my-3">{children}</h3>,
//     blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">{children}</blockquote>,
//   },
//   list: {
//     bullet: ({children}) => <ul className="list-disc list-inside my-4 space-y-1">{children}</ul>,
//     number: ({children}) => <ol className="list-decimal list-inside my-4 space-y-1">{children}</ol>,
//   },
//   listItem: {
//     bullet: ({children}) => <li>{children}</li>,
//     number: ({children}) => <li>{children}</li>,
//   },
//   marks: {
//     link: ({value, children}) => {
//       const target = (value?.href || '').startsWith('http') ? '_blank' : undefined;
//       return <Link href={value?.href || '#'} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} className="text-primary hover:underline">{children}</Link>;
//     },
//     strong: ({children}) => <strong>{children}</strong>,
//     em: ({children}) => <em>{children}</em>,
//   },
//   types: {
//      image: ({value}) => { // Example for inline images in Portable Text
//          if (!value?.asset?._ref) return null;
//          return (
//              <div className="my-4 relative aspect-video"> {/* Adjust aspect ratio as needed */}
//                  <Image src={urlForImage(value).fit('max').url()} alt={value.alt || ' '} fill className="object-contain" />
//              </div>
//          );
//      }
//   }
// };

// --- Placeholder Components (would be more complex in reality) ---
const VariantSelector = ({ variants }: { variants: ProductVariant[] }) => {
  if (!variants || variants.length === 0) return null;
  // Basic display, actual selector would involve state and UI elements
  return (
    <div className="mt-4">
      <h3 className="text-md font-medium text-gray-700 mb-2">Available Options:</h3>
      <div className="flex flex-wrap gap-2">
        {variants.map(variant => (
          <Button key={variant._key} variant="outline" size="sm" className="text-xs">
            {variant.name} (Stock: {variant.stockQuantity})
            {variant.price && ` - ₹${variant.price.toFixed(2)}`}
          </Button>
        ))}
      </div>
    </div>
  );
};

const AddToCartButton = ({ product }: { product: Product }) => {
  // Actual add to cart logic would involve Zustand store, API calls, etc.
  const handleAddToCart = () => {
    alert(`Added ${product.name} to cart (placeholder action)!`);
  };
  return (
    <Button size="lg" className="w-full sm:w-auto mt-6" onClick={handleAddToCart}>
      Add to Cart
    </Button>
  );
};
// --- End Placeholder Components ---


interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata(
  { params }: ProductPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const mainImageUrl = product.mainImage?.asset?.url ? urlForImage(product.mainImage).url() : undefined;
  const ogImageUrl = product.seo?.og_image?.asset?.url ? urlForImage(product.seo.og_image).url() : mainImageUrl;

  return {
    title: product.seo?.title || product.name || 'Product Details',
    description: product.seo?.description || product.excerpt || `Details for ${product.name}`,
    openGraph: {
      title: product.seo?.title || product.name,
      description: product.seo?.description || product.excerpt || '',
      images: ogImageUrl ? [ogImageUrl, ...previousImages] : previousImages,
      type: 'product',
      // Future: Add more product specific OG tags like price, brand, availability
      // availability: product.stockQuantity && product.stockQuantity > 0 ? 'instock' : 'oos',
      // brand: product.brand,
      // price: { amount: (product.salePrice || product.price).toFixed(2), currency: 'INR' }
    },
  };
}


export default async function ProductPage({ params }: ProductPageProps) {
  const slug = params.slug;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const displayPrice = product.salePrice != null && product.salePrice < product.price
                       ? product.salePrice
                       : product.price;
  const originalPrice = product.price;
  const onSale = product.salePrice != null && product.salePrice < product.price;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-8 lg:gap-x-12">
        {/* Image Gallery Section */}
        <div className="space-y-4">
          {product.mainImage?.asset && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-md">
              <Image
                src={urlForImage(product.mainImage).url()}
                alt={product.mainImage.alt || product.name || 'Main product image'}
                fill
                className="object-cover"
                priority // Prioritize loading LCP image
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
              />
            </div>
          )}
          {product.additionalImages && product.additionalImages.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {product.additionalImages.map((img) => (
                img.asset && (
                    <div key={img.asset._id} className="relative aspect-square w-full overflow-hidden rounded-md shadow-sm cursor-pointer hover:opacity-80">
                    <Image
                        src={urlForImage(img).width(200).height(200).fit('crop').url()}
                        alt={img.alt || product.name || 'Additional product image'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 30vw, 150px"
                    />
                    </div>
                )
              ))}
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="space-y-4 md:space-y-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">{product.name}</h1>

          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-semibold ${onSale ? 'text-red-600' : 'text-gray-800'}`}>
              ₹{displayPrice.toFixed(2)}
            </p>
            {onSale && (
              <p className="text-lg text-gray-500 line-through">
                ₹{originalPrice.toFixed(2)}
              </p>
            )}
          </div>

          {product.excerpt && <p className="text-sm text-gray-600">{product.excerpt}</p>}

          {product.brand && <p className="text-sm text-gray-500">Brand: <span className="font-medium text-gray-700">{product.brand}</span></p>}
          {product.sku && <p className="text-sm text-gray-500">SKU: <span className="font-medium text-gray-700">{product.sku}</span></p>}

          {product.categories && product.categories.length > 0 && (
            <div className="text-sm text-gray-600">
              Categories: {product.categories.map((cat, index) => (
                <React.Fragment key={cat._id}>
                  <Link href={`/category/${cat.slug.current}`} className="text-primary hover:underline">
                    {cat.name}
                  </Link>
                  {index < product.categories!.length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
            </div>
          )}

          <article className="prose prose-sm sm:prose max-w-none text-gray-700 mt-4 pt-4 border-t">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Product Description</h2>
            {/* Replace with actual PortableText component and content */}
            {/* <PortableText value={product.descriptionRaw as any} components={customPortableTextComponents} /> */}
            {product.descriptionRaw?.map(block =>
                block._type === 'block' && block.children?.map(span => span.text).join('')
            ).join('\n\n').split('\n').map((paragraph, index) => <p key={index} className="mb-2">{paragraph}</p>) || <p>No description available.</p>}
          </article>

          {product.variants && product.variants.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <VariantSelector variants={product.variants} />
            </div>
          )}

          <div className="mt-6">
            <AddToCartButton product={product} />
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="mt-4 pt-4 border-t text-sm text-gray-600">
              Tags: {product.tags.join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Optional: generateStaticParams
// import { sanityClient } from '@/lib/sanity/client';
// export async function generateStaticParams() {
//   const products = await sanityClient.fetch<{slug: {current: string}}[]>(`*[_type == "product" && defined(slug.current) && status == "active"]{ "slug": slug.current }`);
//   return products.map((product) => ({
//     slug: product.slug.current,
//   }));
// }
