"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
// import { updateOrderStatus } from "@/lib/api/order"; // No longer needed
import { trpc } from "@/lib/providers"; // Import trpc instance
import { OrderStatusFieldDTO } from "@/server/application/common/dtos/order";
import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation, useQueryClient } from "@tanstack/react-query"; // No longer needed
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
  // const queryClient = useQueryClient(); // No longer needed directly
  const { toast } = useToast();
  const utils = trpc.useContext();

  const form = useForm< // Renamed form instance
    z.infer<typeof UpdateOrderStatusFormSchema>
  >({
    resolver: zodResolver(UpdateOrderStatusFormSchema),
    defaultValues: {
      order_status,
    },
  });

  const updateOrderMutation = trpc.adminOrder.update.useMutation({
    onSuccess: (data) => { // data is { success: boolean, message: string }
      utils.adminOrder.getById.invalidate({ id }); // Invalidate the specific order query
      // utils.adminOrder.getAll.invalidate(); // Optionally invalidate list if status change affects list view
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error) =>
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "Error updating order status.",
      }),
  });

  const onSubmit = async (
    values: z.infer<typeof UpdateOrderStatusFormSchema>
  ) => {
    updateOrderMutation.mutate({ id, order_status: values.order_status });
  };

  return (
    <Form {...form}>
      <form
        className="flex items-end gap-x-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <SelectInput
          control={form.control} // Pass control
          name={"order_status"}
          label={"Order Status"}
          placeholder={"Select Status"} // Changed placeholder
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
