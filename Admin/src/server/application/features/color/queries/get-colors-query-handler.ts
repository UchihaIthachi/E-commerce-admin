import { getColors } from "@/server/infrastructure/repositories/attributes/color-repository";

export default async function getColorsQueryHandler() {
  return await getColors();
}