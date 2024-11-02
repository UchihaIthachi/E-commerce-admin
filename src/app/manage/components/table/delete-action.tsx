"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { deleteCategory } from "@/lib/api/category";
import {
  MutationFunction,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

type DeleteActionProps = {
  _id: string;
  queryKey: string;
  mutationFn: MutationFunction<
    void,
    {
      _id: string;
    }
  >;
  message: string;
};

function DeleteAction({
  _id,
  queryKey,
  mutationFn,
  message,
}: DeleteActionProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate } = useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries([`${queryKey}`]),
    onError: () =>
      toast({
        title: "Error",
        variant: "destructive",
        description: message,
      }),
  });

  return (
    <Button
      variant={"link"}
      type="button"
      className="text-red-500 p-0 h-auto hover:no-underline"
      onClick={() => mutate({ _id })}
    >
      Delete
    </Button>
  );
}

export default DeleteAction;
