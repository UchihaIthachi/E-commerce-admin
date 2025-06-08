import {NextRequest} from "next/server";
import {log} from "@/server/application/common/services/logging";
import lifeCycleErrorHandlingMiddleware from "@/server/api/middleware/lifecycle-error-handling-middleware";
import getGridItemsQueryHandler from "@/server/application/features/grid-item/query/get-grid-items-query-handler";
import {AddBannerDTO} from "@/server/application/common/dtos/banner";
import ValidationError from "@/server/application/common/errors/validation-error";
import createBannerCommandHandler from "@/server/application/features/banner/commands/create-banner-command-handler";
import {AddGridItemDTO} from "@/server/application/common/dtos/grid-item";
import createGridItemCommandHandler
    from "@/server/application/features/grid-item/commands/create-grid-item-command-handler";

export async function GET(request: NextRequest) {
    try {
        const gridItems = await getGridItemsQueryHandler();

        return new Response(JSON.stringify(gridItems), {
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
        const requestBody = AddGridItemDTO.safeParse(body);

        if (!requestBody.success) {
            throw new ValidationError();
        }

        await createGridItemCommandHandler({...requestBody.data});

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