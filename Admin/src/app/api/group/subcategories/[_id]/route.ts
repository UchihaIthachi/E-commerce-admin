export const dynamic = "force-dynamic";

import updateSubCategoryCommandHandler
    from "@/server/application/features/subcategory/commands/update-subcategory-command-handler";
import lifeCycleErrorHandlingMiddleware from "@/server/api/middleware/lifecycle-error-handling-middleware";
import ValidationError from "@/server/application/common/errors/validation-error";
import {log} from "@/server/application/common/services/logging";
import {NextRequest} from "next/server";
import {EditSubCategoryDTO} from "@/server/application/common/dtos/subcategory";
import getSubCategoryQueryHandler
    from "@/server/application/features/subcategory/queries/get-subcategory-query-handler";
import deleteSubCategoryCommandHandler
    from "@/server/application/features/subcategory/commands/delete-subcategory-command-handler";

export async function DELETE(
    request: NextRequest,
    {params: {_id}}: { params: { _id: string } }
) {
    try {
        await deleteSubCategoryCommandHandler({_id});

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
    {params: {_id}}: { params: { _id: string } }
) {
    try {
        const banner = await getSubCategoryQueryHandler({_id});

        return new Response(JSON.stringify(banner), {
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
        const requestBody = EditSubCategoryDTO.safeParse(body);

        if (!requestBody.success) {
            throw new ValidationError();
        }

        await updateSubCategoryCommandHandler({_id, ...requestBody.data});

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
