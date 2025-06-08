"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {Label} from "@radix-ui/react-dropdown-menu";
import {useForm} from "react-hook-form";
import {z} from "zod";
import SelectInput from "../../../select-input";
import {SelectItem} from "@/components/ui/select";
import {Form} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {
    updateDeliveryStatus,
    updateOrderStatus,
    updatePaymentStatus,
} from "@/lib/api/order";
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
    const queryClient = useQueryClient();
    const {toast} = useToast();

    const updateOrderStatusForm = useForm<
        z.infer<typeof UpdateDeliveryStatusFormSchema>
    >({
        resolver: zodResolver(UpdateDeliveryStatusFormSchema),
        defaultValues: {
            delivery_status,
        },
    });

    const {
        mutate: deliveryStatusMutate,
        isLoading: IsDeliveryStatusMutateLoading,
    } = useMutation({
        mutationFn: updateDeliveryStatus,
        onSuccess: () => {
            queryClient.invalidateQueries(["ORDER", id])
            toast({title:"Successfully updated delivery status", variant: "default"})
        },
        onError: () =>
            toast({
                title: "Error while updating delviery status.",
                variant: "destructive",
            }),
    });

    const onSubmit = async (
        values: z.infer<typeof UpdateDeliveryStatusFormSchema>
    ) => {
        deliveryStatusMutate({id, delivery_status: values.delivery_status});
    };

    return (
        <Form {...updateOrderStatusForm}>
            <form
                className="flex items-end gap-x-4"
                onSubmit={updateOrderStatusForm.handleSubmit(onSubmit)}
            >
                <SelectInput
                    name={"delivery_status"}
                    label={"Delivery Status"}
                    placeholder={""}
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
