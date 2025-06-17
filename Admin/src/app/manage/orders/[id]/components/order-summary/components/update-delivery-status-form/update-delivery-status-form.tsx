"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {Label} from "@radix-ui/react-dropdown-menu";
import {useForm} from "react-hook-form";
import {z} from "zod";
import SelectInput from "../../../select-input";
import {SelectItem} from "@/components/ui/select";
import {Form} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
// import {useMutation, useQueryClient} from "@tanstack/react-query"; // No longer needed
// import { updateDeliveryStatus } from "@/lib/api/order"; // No longer needed
import { trpc } from "@/lib/providers"; // Import trpc instance
import {useParams} from "next/navigation";
import {useToast} from "@/components/ui/use-toast";
import {
    DeliveryStatusFieldDTO,
    OrderStatusFieldDTO,
    PaymentStatusFieldDTO,
} from "@/server/application/common/dtos/order";
import {Loader2} from "lucide-react";

const UpdateDeliveryStatusFormSchema = z.object({
    delivery_status: DeliveryStatusFieldDTO,
});

type UpdateDeliveryStatusFormProps = {
    delivery_status: z.infer<typeof DeliveryStatusFieldDTO>;
};

const values = ["IDLE", "PROCESSING", "DISPATCHED", "DELIVERED"];

function UpdateDeliveryStatusForm({
                                      delivery_status,
                                  }: UpdateDeliveryStatusFormProps) {
    const {id}: { id: string } = useParams();
    // const queryClient = useQueryClient(); // No longer needed directly
    const {toast} = useToast();
    const utils = trpc.useContext();

    const form = useForm< // Renamed form instance
        z.infer<typeof UpdateDeliveryStatusFormSchema>
    >({
        resolver: zodResolver(UpdateDeliveryStatusFormSchema),
        defaultValues: {
            delivery_status,
        },
    });

    const updateOrderMutation = trpc.adminOrder.update.useMutation({
        onSuccess: (data) => {
            utils.adminOrder.getById.invalidate({ id });
            toast({
                title: "Success",
                description: data.message,
            });
        },
        onError: (error) =>
            toast({
                title: "Error",
                variant: "destructive",
                description: error.message || "Error updating delivery status.",
            }),
    });

    const onSubmit = async (
        values: z.infer<typeof UpdateDeliveryStatusFormSchema>
    ) => {
        updateOrderMutation.mutate({id, delivery_status: values.delivery_status});
    };

    return (
        <Form {...form}>
            <form
                className="flex items-end gap-x-4"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <SelectInput
                    control={form.control} // Pass control
                    name={"delivery_status"}
                    label={"Delivery Status"}
                    placeholder={"Select Status"} // Changed placeholder
                >
                    {values.map((el, i) => (
                        <SelectItem key={i} value={el}>
                            {el}
                        </SelectItem>
                    ))}
                </SelectInput>
                <Button type="submit">
                    {IsDeliveryStatusMutateLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin"/>
                    ) : (
                        "Save"
                    )}
                </Button>
            </form>
        </Form>
    );
}

export default UpdateDeliveryStatusForm;
