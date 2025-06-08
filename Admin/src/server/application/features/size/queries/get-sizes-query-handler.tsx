import { getSizes } from "@/server/infrastructure/repositories/attributes/size-repository";

export default async function getSizesQueryHandler() {
  return await getSizes();
}