export const dynamic = "force-dynamic";

import lifeCycleErrorHandlingMiddleware from "@/server/api/middleware/lifecycle-error-handling-middleware";
import { EditSizeDTO } from "@/server/application/common/dtos/size";
import ValidationError from "@/server/application/common/errors/validation-error";
import { log } from "@/server/application/common/services/logging";
import deleteSizeCommandHandler from "@/server/application/features/size/commands/delete-size-command-handler";
import updateSizeCommandHandler from "@/server/application/features/size/commands/update-size-command-handler";
import getSizeQueryHandler from "@/server/application/features/size/queries/get-size-query-handler";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params: { _id } }: { params: { _id: string } }
) {
  try {
    const body = await request.json();
    const requestBody = EditSizeDTO.safeParse(body);

    if (!requestBody.success) {
      throw new ValidationError();
    }

    await updateSizeCommandHandler({ _id, ...requestBody.data });

    return new Response(null, {
      status: 204,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    log("SEVERE", error);
    return lifeCycleErrorHandlingMiddleware(error as Error);
  }
}

export async function GET(
  request: NextRequest,
  { params: { _id } }: { params: { _id: string } }
) {
  try {
    const size = await getSizeQueryHandler({ _id });

    return new Response(JSON.stringify(size), {
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

export async function DELETE(
  request: NextRequest,
  { params: { _id } }: { params: { _id: string } }
) {
  try {
    await deleteSizeCommandHandler({ _id });

    return new Response(null, {
      status: 204,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    log("SEVERE", error);
    return lifeCycleErrorHandlingMiddleware(error as Error);
  }
}
