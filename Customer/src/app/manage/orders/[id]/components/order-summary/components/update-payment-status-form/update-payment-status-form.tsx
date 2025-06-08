"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-dropdown-menu";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SelectInput from "../../../select-input";
import { SelectItem } from "@/components/ui/select";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus, updatePaymentStatus } from "@/lib/api/order";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import {
  OrderStatusFieldDTO,
  PaymentStatusFieldDTO,
} from "@/server/application/common/dtos/order";
import {Loader2} from "lucide-react";

const UpdatePaymentStatusFormSchema = z.object({
  payment_status: PaymentStatusFieldDTO,
});

type UpdatePaymentStatusFormProps = {
  payment_status: z.infer<typeof PaymentStatusFieldDTO>;
};

const values = ["PENDING", "PAID"];

function UpdatePaymentStatusForm({
  payment_status,
}: UpdatePaymentStatusFormProps) {
  const { id }: { id: string } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateOrderStatusForm = useForm<
    z.infer<typeof UpdatePaymentStatusFormSchema>
  >({
    resolver: zodResolver(UpdatePaymentStatusFormSchema),
    defaultValues: {
      payment_status,
    },
  });

  const {
    mutate: paymentStatusMutate,
    isLoading: IsPaymentStatusMutateLoading,
  } = useMutation({
    mutationFn: updatePaymentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(["ORDER", id])
      toast({title:"Successfully updated payment status", variant: "default"})
    },
    onError: () =>
      toast({
        title: "Error while updating order status.",
        variant: "destructive",
      }),
  });

  const onSubmit = async (
    values: z.infer<typeof UpdatePaymentStatusFormSchema>
  ) => {
    paymentStatusMutate({ id, payment_status: values.payment_status });
  };

  return (
    <Form {...updateOrderStatusForm}>
      <form
        className="flex items-end gap-x-4"
        onSubmit={updateOrderStatusForm.handleSubmit(onSubmit)}
      >
        <SelectInput
          name={"payment_status"}
          label={"Payment Status"}
          placeholder={""}
        >
          {values.map((el, i) => (
            <SelectItem key={i} value={el}>
              {el}
            </SelectItem>
          ))}
        </SelectInput>
        <Button type="submit">
          {IsPaymentStatusMutateLoading ? (
              <Loader2 className="h-4 w-4 animate-spin"/>
          ) : (
              "Save"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default UpdatePaymentStatusForm;
