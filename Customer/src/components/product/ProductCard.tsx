// Customer/src/components/product/ProductCard.tsx
import type { Product } from "@/lib/sanity/client";
import { urlForImage } from "@/lib/sanity/image";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  if (!product?.slug?.current) {
    // Optionally, render a placeholder or log an error if a product is missing essential data
    console.warn("ProductCard received a product with no slug:", product);
    return null;
  }

  const displayPrice = product.salePrice != null && product.salePrice < product.price
                       ? product.salePrice
                       : product.price;
  const originalPrice = product.price;
  const onSale = product.salePrice != null && product.salePrice < product.price;

  const imageUrl = product.mainImage?.asset?._id || product.mainImage?.asset?._ref
    ? urlForImage(product.mainImage).width(250).height(250).fit('crop').url()
    : '/placeholder-image.png'; // Ensure you have a placeholder image at public/placeholder-image.png

  const categoryName = product.categories?.[0]?.name || 'Uncategorized';

  return (
    <Link href={`/product/${product.slug.current}`} className="h-full block group">
      <Card className="flex h-full w-full flex-col justify-between overflow-hidden rounded-lg border shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
        <CardHeader className="relative aspect-[4/3] w-full p-0 overflow-hidden"> {/* Adjusted aspect ratio */}
          <Image
            src={imageUrl}
            fill // Use fill for responsive sizing within the aspect ratio container
            alt={product.mainImage?.alt || product.name || 'Product image'}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" // Basic responsive sizes
          />
        </CardHeader>
        <CardContent className="p-3 sm:p-4 flex-grow flex flex-col justify-between">
          <div>
            <CardTitle className="line-clamp-2 text-sm font-semibold leading-tight sm:text-base group-hover:text-primary">
              {product.name}
            </CardTitle>
            <CardDescription className="mt-1 text-xs text-gray-500 sm:text-sm">
              {categoryName}
            </CardDescription>
          </div>
        </CardContent>
        <CardFooter className="w-full p-3 pt-1 sm:p-4 sm:pt-2">
          <div className="flex items-baseline gap-2">
            <p className={`font-semibold ${onSale ? 'text-red-600' : 'text-primary'}`}>
              ₹{displayPrice.toFixed(2)}
            </p>
            {onSale && (
              <p className="text-xs text-gray-500 line-through">
                ₹{originalPrice.toFixed(2)}
              </p>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
