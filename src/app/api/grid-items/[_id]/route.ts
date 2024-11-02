import {NextRequest} from "next/server";
import {log} from "@/server/application/common/services/logging";
import lifeCycleErrorHandlingMiddleware from "@/server/api/middleware/lifecycle-error-handling-middleware";
import getGridItemQueryHandler from "@/server/application/features/grid-item/query/get-grid-item-query-handler";
import {EditBannerDTO} from "@/server/application/common/dtos/banner";
import ValidationError from "@/server/application/common/errors/validation-error";
import updateBannerCommandHandler from "@/server/application/features/banner/commands/update-banner-command-handler";
import updateGridItemCommandHandler
    from "@/server/application/features/grid-item/commands/update-grid-item-command-handler";
import {EditGridItemDTO} from "@/server/application/common/dtos/grid-item";

export async function GET(
    request: NextRequest,
    {params: {_id}}: { params: { _id: string } }
) {
    try {
        const grid_item = await getGridItemQueryHandler({_id});

        return new Response(JSON.stringify(grid_item), {
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

export async function PATCH(
    request: NextRequest,
    {params: {_id}}: { params: { _id: string } }
) {
    try {
        const body = await request.json();
        const requestBody = EditGridItemDTO.safeParse(body);

        if (!requestBody.success) {
            throw new ValidationError();
        }

        await updateGridItemCommandHandler({_id, ...requestBody.data});

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