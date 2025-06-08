export const dynamic = "force-dynamic";

import lifeCycleErrorHandlingMiddleware from "@/server/api/middleware/lifecycle-error-handling-middleware";
import { AddSubCategoryDTO } from "@/server/application/common/dtos/subcategory";
import ValidationError from "@/server/application/common/errors/validation-error";
import { log } from "@/server/application/common/services/logging";
import createSubCategoryCommandHandler from "@/server/application/features/subcategory/commands/create-subcategory-command-handler";
import getSubCategoryCommandHandler from "@/server/application/features/subcategory/queries/get-subcategories-query-handler";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const subcategories = await getSubCategoryCommandHandler();

    return new Response(JSON.stringify(subcategories), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    log("SEVERE", error);
    return lifeCycleErrorHandlingMiddleware(error as Error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requestBody = AddSubCategoryDTO.safeParse(body);
    if (!requestBody.success) {
      throw new ValidationError();
    }

    await createSubCategoryCommandHandler({ ...requestBody.data });

    return new Response(null, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    log("SEVERE", error);
    return lifeCycleErrorHandlingMiddleware(error as Error);
  }
}
