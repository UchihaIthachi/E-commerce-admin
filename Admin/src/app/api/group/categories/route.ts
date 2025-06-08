export const dynamic = "force-dynamic";

import lifeCycleErrorHandlingMiddleware from "@/server/api/middleware/lifecycle-error-handling-middleware";
// AddCategoryDTO removed
import ValidationError from "@/server/application/common/errors/validation-error"; // Kept as lifeCycleErrorHandlingMiddleware might use it implicitly or log might pass it
import { log } from "@/server/application/common/services/logging";
// createCategoryCommandHandler removed
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

// POST function handler removed
