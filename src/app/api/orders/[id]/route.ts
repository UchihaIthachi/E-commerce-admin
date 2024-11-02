import lifeCycleErrorHandlingMiddleware from "@/server/api/middleware/lifecycle-error-handling-middleware";
import {UpdateOrderDTO} from "@/server/application/common/dtos/order";
import ValidationError from "@/server/application/common/errors/validation-error";
import {log} from "@/server/application/common/services/logging";
import updateOrderCommandHandler from "@/server/application/features/order/commands/update-order-command-handler";
import {getOrderSummary} from "@/server/infrastructure/repositories/order/order-repository";
import {NextRequest} from "next/server";
import getOrderQueryHandler from "@/server/application/features/order/queries/get-order-query-handler";

export async function GET(
    request: NextRequest,
    {params: {id}}: { params: { id: string } }
) {
    try {
        const order = await getOrderQueryHandler({id});

        return new Response(JSON.stringify(order), {
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
    {params: {id}}: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const requestBody = UpdateOrderDTO.safeParse(body);
        if (!requestBody.success) {
            throw new ValidationError(requestBody.error.message);
        }

        await updateOrderCommandHandler({id, ...requestBody.data});

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
