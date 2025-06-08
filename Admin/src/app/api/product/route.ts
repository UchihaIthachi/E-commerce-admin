import {AddProductDTO, EditProductDTO} from "@/server/application/common/dtos/cloth";
import ValidationError from "@/server/application/common/errors/validation-error";
import createProductCommandHandler from "@/server/application/features/product/commands/create-product-command";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const requestBody = AddProductDTO.safeParse(body);
  if (!requestBody.success) {
    throw new ValidationError(requestBody.error.message);
  }
  await createProductCommandHandler({ ...requestBody.data });

  return new Response(null, {
    status: 201,
    headers: {
      "Content-Type": "application/json",
    },
  });
}