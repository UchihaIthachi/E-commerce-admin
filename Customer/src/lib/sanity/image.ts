// Customer/src/lib/sanity/image.ts
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { sanityClient } from './client'; // Use the configured client

const builder = imageUrlBuilder(sanityClient);

export function urlForImage(source: SanityImageSource) {
  if (!source?.asset?._ref && !source?.asset?._id) { // Check if source or nested asset has an ID/ref
    // Return a path to a placeholder image or handle appropriately
    // console.warn("Image source is missing asset reference:", source);
    return {
        url: () => '/placeholder-image.png', // Default placeholder
        width: () => ({ url: () => '/placeholder-image.png'}), // Mock methods if needed
        height: () => ({ url: () => '/placeholder-image.png'}),
        fit: () => ({ url: () => '/placeholder-image.png'}),
        // Add any other methods you chain on urlForImage
    };
  }
  return builder.image(source);
}
