export const dynamic = "force-dynamic";

import lifeCycleErrorHandlingMiddleware from "@/server/api/middleware/lifecycle-error-handling-middleware";
import { AddCategoryDTO } from "@/server/application/common/dtos/category";
import ValidationError from "@/server/application/common/errors/validation-error";
import { log } from "@/server/application/common/services/logging";
import createCategoryCommandHandler from "@/server/application/features/category/commands/create-category-command-handler";
import getCategoriesQueryHandler from "@/server/application/features/category/queries/get-categories-query-handler";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const categories = await getCategoriesQueryHandler();

    return new Response(JSON.stringify(categories), {
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
    const requestBody = AddCategoryDTO.safeParse(body);

    if (!requestBody.success) {
      throw new ValidationError();
    }

    await createCategoryCommandHandler({ ...requestBody.data });

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
