import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getNameByPropertyId = (
  data:
    | {
        name: string;
        _id: string;
      }[]
    | undefined,
  _id: string
) => {
  if (!data) {
    return null;
  }
  const found = data.find((el) => el._id === _id);
  if (!found) {
    return null;
  }
  return found.name.toUpperCase();
};

export const getSelectedColors = (
  variants: { id: string; color: string; size: string; stock: number }[],
  colors:
    | {
        name: string;
        _id: string;
      }[]
    | undefined
) => {
  if (!colors || variants.length === 0) {
    return [];
  }

  // Create a set to store unique color objects based on _id
  const uniqueColors = new Set<{ name: string; _id: string }>();

  // Iterate through variants and check if the color exists in the available colors
  for (const variant of variants) {
    const matchingColor = colors.find((color) => color._id === variant.color);
    if (matchingColor) {
      // Add the matching color to the uniqueColors set
      uniqueColors.add(matchingColor);
    }
  }

  // Convert the set back to an array and return it
  return Array.from(uniqueColors);
};

export const filterMediaByColor = (
  newValues: {
    id: string;
    color: string;
    size: string;
    stock: number;
  }[],
  media: {
    id: string;
    color: string;
    images: {
      id: string;
      file: File;
    }[];
    isDefault: boolean;
  }[]
) => {
  // Create an array to store the filtered media elements
  const filteredMedia: {
    id: string;
    color: string;
    images: {
      id: string;
      file: File;
    }[];
    isDefault: boolean;
  }[] = [];

  // Create a Set to store unique color values from newValues
  const uniqueColors = new Set<string>(newValues.map((value) => value.color));

  // Iterate through the media array and filter by color
  for (const mediaItem of media) {
    if (uniqueColors.has(mediaItem.color)) {
      filteredMedia.push(mediaItem);
    }
  }

  return filteredMedia;
};
