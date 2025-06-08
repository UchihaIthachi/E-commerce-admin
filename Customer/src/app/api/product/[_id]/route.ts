import {NextRequest} from "next/server";
import {EditProductDTO} from "@/server/application/common/dtos/cloth";
import ValidationError from "@/server/application/common/errors/validation-error";
import editProductCommandHandler from "@/server/application/features/product/commands/edit-product-command-handler";

export async function PUT(
    request: NextRequest,
    {params: {_id}}: { params: { _id: string } }
) {
    const body = await request.json();
    const requestBody = EditProductDTO.safeParse(body);
    if (!requestBody.success) {
        throw new ValidationError(requestBody.error.message);
    }

    await editProductCommandHandler({...requestBody.data});

    return new Response(null, {
        status: 201,
        headers: {
            "Content-Type": "application/json",
        },
    });
}