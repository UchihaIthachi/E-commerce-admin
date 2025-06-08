import { getSize } from "@/server/infrastructure/repositories/attributes/size-repository";

type GetSizeQuery = {
  _id: string;
};

export default async function getSizeQueryHandler(
  command: GetSizeQuery
) {
  return await getSize(command._id);
}