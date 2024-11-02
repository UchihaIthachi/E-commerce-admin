import {NextRequest} from "next/server";
import {log} from "@/server/application/common/services/logging";
import lifeCycleErrorHandlingMiddleware from "@/server/api/middleware/lifecycle-error-handling-middleware";
import getBannersQueryHandler from "@/server/application/features/banner/queries/get-banners-query-handler";
import {AddCategoryDTO} from "@/server/application/common/dtos/category";
import ValidationError from "@/server/application/common/errors/validation-error";
import {AddBannerDTO} from "@/server/application/common/dtos/banner";
import createBannerCommandHandler from "@/server/application/features/banner/commands/create-banner-command-handler";

export async function GET(request: NextRequest) {
    try {
        const banners = await getBannersQueryHandler();

        return new Response(JSON.stringify(banners), {
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
        const requestBody = AddBannerDTO.safeParse(body);
        if (!requestBody.success) {
            throw new ValidationError();
        }

        await createBannerCommandHandler({...requestBody.data});

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