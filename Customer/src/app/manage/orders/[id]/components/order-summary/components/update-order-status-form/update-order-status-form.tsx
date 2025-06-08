"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { updateOrderStatus } from "@/lib/api/order";
import { OrderStatusFieldDTO } from "@/server/application/common/dtos/order";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SelectInput from "../../../select-input";

const UpdateOrderStatusFormSchema = z.object({
  order_status: OrderStatusFieldDTO,
});

type UpdateOrderStatusFormProps = {
  order_status: z.infer<typeof OrderStatusFieldDTO>;
};

const values = ["PENDING", "PROCESSING", "FULFILLED", "REJECTED"];

function UpdateOrderStatusForm({ order_status }: UpdateOrderStatusFormProps) {
  const { id }: { id: string } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateOrderStatusForm = useForm<
    z.infer<typeof UpdateOrderStatusFormSchema>
  >({
    resolver: zodResolver(UpdateOrderStatusFormSchema),
    defaultValues: {
      order_status,
    },
  });

  const { mutate: orderStatusMutate, isLoading: IsOrderStatusMutateLoading } =
    useMutation({
      mutationFn: updateOrderStatus,
      onSuccess: () => {
        queryClient.invalidateQueries(["ORDER", id]);
        toast({
          title: "Successfully updated order status",
          variant: "default",
        });
      },
      onError: () =>
        toast({
          title: "Error while updating order status.",
          variant: "destructive",
        }),
    });

  const onSubmit = async (
    values: z.infer<typeof UpdateOrderStatusFormSchema>
  ) => {
    orderStatusMutate({ id, order_status: values.order_status });
  };

  return (
    <Form {...updateOrderStatusForm}>
      <form
        className="flex items-end gap-x-4"
        onSubmit={updateOrderStatusForm.handleSubmit(onSubmit)}
      >
        <SelectInput
          name={"order_status"}
          label={"Order Status"}
          placeholder={""}
        >
          {values.map((el, i) => (
            <SelectItem key={i} value={el}>
              {el}
            </SelectItem>
          ))}
        </SelectInput>
        <Button type="submit">
          {IsOrderStatusMutateLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Save"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default UpdateOrderStatusForm;
