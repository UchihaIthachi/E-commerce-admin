import lifeCycleErrorHandlingMiddleware from "@/server/api/middleware/lifecycle-error-handling-middleware";
import { OrderFilters } from "@/server/application/common/dtos/order";
import ValidationError from "@/server/application/common/errors/validation-error";
import { log } from "@/server/application/common/services/logging";
import getOrdersQueryHandler from "@/server/application/features/order/queries/get-orders-query-handler";
import { NextRequest } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const filters = OrderFilters.safeParse(
      Object.fromEntries(request.nextUrl.searchParams)
    );

    if (filters.success === false) {
      throw new ValidationError();
    }
    const orders = await getOrdersQueryHandler(filters.data);

    return new Response(JSON.stringify(orders), {
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
