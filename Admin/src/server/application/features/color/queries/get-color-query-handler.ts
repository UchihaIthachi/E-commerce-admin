import { getColor } from "@/server/infrastructure/repositories/attributes/color-repository";

type GetColorQuery = {
  _id: string;
};

export default async function getColorQueryHandler(
  command: GetColorQuery
) {
  return await getColor(command._id);
}