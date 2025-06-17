// Customer/src/app/page.tsx
import Billboard from "@/components/Billboard";
import CategoryCardSection from "@/components/category/CategoryCardSection";
import ProductMarquee from "@/components/product/ProductsMarqueeWrapper";

// Import new components and functions
import { getFeaturedProducts } from "@/lib/sanity/client";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/lib/sanity/client";

// Component to display a list/grid of products
function FeaturedProductsSection({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4"> {/* Ensure px-4 matches overall page padding if needed or remove if page.tsx handles it */}
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-center text-gray-900 sm:text-3xl md:mb-8">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 md:gap-x-6 md:gap-y-8 lg:grid-cols-4"> {/* Adjusted grid-cols-1 for smallest screens */}
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  let featuredProducts: Product[] = [];
  try {
    featuredProducts = await getFeaturedProducts(4);
  } catch (error) {
    console.error("Failed to fetch featured products for Home page:", error);
    // Optionally, render a specific error message or fallback UI
  }

  return (
    <main className=""> {/* Removed px-2 from main, assuming container in section or page root handles padding */}
      <Billboard />
      <ProductMarquee />
      <FeaturedProductsSection products={featuredProducts} />
      <CategoryCardSection />
    </main>
  );
}
