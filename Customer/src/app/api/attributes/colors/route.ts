export const dynamic = "force-dynamic";

import lifeCycleErrorHandlingMiddleware from "@/server/api/middleware/lifecycle-error-handling-middleware";
import { AddColorDTO } from "@/server/application/common/dtos/color";
import ValidationError from "@/server/application/common/errors/validation-error";
import { log } from "@/server/application/common/services/logging";
import createColorCommandHandler from "@/server/application/features/color/commands/create-color-command-handler";
import getColorsQueryHandler from "@/server/application/features/color/queries/get-colors-query-handler";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
      const colors = await getColorsQueryHandler();
  
      return new Response(JSON.stringify(colors), {
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
      const requestBody = AddColorDTO.safeParse(body);
  
      if (!requestBody.success) {
        throw new ValidationError();
      }
  
      await createColorCommandHandler({ ...requestBody.data });
  
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