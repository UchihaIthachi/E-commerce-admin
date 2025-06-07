export const dynamic = "force-dynamic";

import lifeCycleErrorHandlingMiddleware from "@/server/api/middleware/lifecycle-error-handling-middleware";
// EditCategoryDTO removed
import ValidationError from "@/server/application/common/errors/validation-error"; // Kept
import { log } from "@/server/application/common/services/logging";
// deleteCategoryCommandHandler removed
// updateCategoryCommandHandler removed
import getCategoryQueryHandler from "@/server/application/features/category/queries/get-category-query-handler";
import { NextRequest } from "next/server";

// DELETE function handler removed

export async function GET(
  request: NextRequest,
  { params: { _id } }: { params: { _id: string } }
) {
  try {
    const category = await getCategoryQueryHandler({ _id });

    return new Response(JSON.stringify(category), {
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

// PATCH function handler removed
