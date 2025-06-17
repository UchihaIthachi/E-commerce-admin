// Customer/src/app/page.tsx
import Billboard from "@/components/Billboard";
import CategoryCardSection from "@/components/category/CategoryCardSection";
import ProductMarquee from "@/components/product/ProductsMarqueeWrapper";

// Import new components and functions
import { getFeaturedProducts, getAllBanners } from "@/lib/sanity/client"; // Added getAllBanners
import ProductCard from "@/components/product/ProductCard";
import type { Product, SanityBanner } from "@/lib/sanity/client"; // Added SanityBanner

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
  let allBanners: SanityBanner[] = [];

  try {
    // Fetch in parallel if desired, or sequentially
    featuredProducts = await getFeaturedProducts(4);
  } catch (error) {
    console.error("Failed to fetch featured products for Home page:", error);
  }

  try {
    allBanners = await getAllBanners();
  } catch (error) {
    console.error("Failed to fetch banners for Home page:", error);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Your E-commerce Site'; // Example, use actual env var if set
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || siteName; // Can be same as site or specific company
  const logoUrl = `${appUrl}/icons/logo-seo.png`; // Adjust path as needed, ensure this logo exists

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": companyName,
    "url": appUrl,
    "logo": logoUrl,
    // "sameAs": [ // Optional: Links to social media profiles
    //   "https://www.facebook.com/yourcompany",
    //   "https://www.twitter.com/yourcompany",
    // ]
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": appUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${appUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <main className=""> {/* Removed px-2 from main, assuming container in section or page root handles padding */}
        <Billboard banners={allBanners} />
        <ProductMarquee />
        <FeaturedProductsSection products={featuredProducts} />
        <CategoryCardSection />
      </main>
    </>
  );
}
