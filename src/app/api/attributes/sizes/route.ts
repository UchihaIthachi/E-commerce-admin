export const dynamic = "force-dynamic";

import lifeCycleErrorHandlingMiddleware from "@/server/api/middleware/lifecycle-error-handling-middleware";
import { AddSizeDTO } from "@/server/application/common/dtos/size";
import ValidationError from "@/server/application/common/errors/validation-error";
import { log } from "@/server/application/common/services/logging";
import createSizeCommandHandler from "@/server/application/features/size/commands/create-size-command-handler";
import getSizesQueryHandler from "@/server/application/features/size/queries/get-sizes-query-handler";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sizes = await getSizesQueryHandler();

    return new Response(JSON.stringify(sizes), {
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
    const requestBody = AddSizeDTO.safeParse(body);

    if (!requestBody.success) {
      throw new ValidationError();
    }

    await createSizeCommandHandler({ ...requestBody.data });

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
