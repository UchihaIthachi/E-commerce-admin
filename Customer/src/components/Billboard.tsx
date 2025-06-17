"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { SanityBanner } from "@/lib/sanity/client"; // Import the new type

interface BillboardProps {
  banners: SanityBanner[];
}

export default function Billboard({ banners }: BillboardProps) {
  if (!banners || banners.length === 0) {
    // Optional: render a fallback, or null to render nothing
    // For now, returning null if no banners.
    // You could also return a placeholder component.
    return null;
  }

  return (
    <div className="flex-1 py-4">
      <Carousel
        opts={{
          loop: true,
          align: "start",
        }}
        plugins={[
          Autoplay({
            delay: 4000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
      >
        <CarouselContent>
          {banners.map((banner) => (
            banner.desktop_image && ( // Only render if desktop_image exists
              <CarouselItem key={banner._id}>
                <AspectRatio ratio={2 / 1}>
                  <Image
                    className="w-full rounded-lg"
                    src={banner.desktop_image} // Use desktop_image URL
                    alt={banner.name || 'Promotional banner'} // Use banner name or a generic alt
                    priority // Keep priority for LCP if this is often the first large image
                    width={1920} // Keep existing dimensions
                    height={960}
                    // Consider objectFit if aspect ratio of source images might vary
                  />
                </AspectRatio>
              </CarouselItem>
            )
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
