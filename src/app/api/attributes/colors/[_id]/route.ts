export const dynamic = "force-dynamic";

import lifeCycleErrorHandlingMiddleware from "@/server/api/middleware/lifecycle-error-handling-middleware";
import { EditColorDTO } from "@/server/application/common/dtos/color";
import ValidationError from "@/server/application/common/errors/validation-error";
import { log } from "@/server/application/common/services/logging";
import deleteColorCommandHandler from "@/server/application/features/color/commands/delete-color-command-handler";
import updateColorCommandHandler from "@/server/application/features/color/commands/update-color-command-handler";
import getColorQueryHandler from "@/server/application/features/color/queries/get-color-query-handler";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params: { _id } }: { params: { _id: string } }
) {
  try {
    const body = await request.json();
    const requestBody = EditColorDTO.safeParse(body);

    if (!requestBody.success) {
      throw new ValidationError();
    }

    await updateColorCommandHandler({ _id, ...requestBody.data });

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
    const color = await getColorQueryHandler({ _id });

    return new Response(JSON.stringify(color), {
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
    await deleteColorCommandHandler({ _id });

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
