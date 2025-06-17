import Billboard from "@/components/Billboard";
import CategoryCardSection from "@/components/category/CategoryCardSection";
import ProductMarquee from "@/components/product/ProductsMarqueeWrapper";
import { getAllBanners } from "@/lib/sanity/client"; // Added getAllBanners
import type { SanityBanner } from "@/lib/sanity/client"; // Added SanityBanner

export default async function Home() { // Changed to async
  let allBanners: SanityBanner[] = [];
  try {
    allBanners = await getAllBanners();
  } catch (error) {
    console.error("Failed to fetch banners for (landpage)/page.tsx:", error);
    // Optionally, render a specific error message or fallback UI
  }

  return (
    <main className="px-2">
      <Billboard banners={allBanners} />
      <ProductMarquee />
      <CategoryCardSection />
    </main>
  );
}
