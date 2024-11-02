
import TextInput from "@/app/manage/components/form/text-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { addSize } from "@/lib/api/size";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AddSizeFormSchema = z.object({
    name: z.string().min(2).max(50).refine((v) => v === v.toUpperCase(), {
      message: "Size Names can't have simple letters",
    }),
  });

  function AddSizeForm() {
    const AddSizeForm = useForm<z.infer<typeof AddSizeFormSchema>>({
      resolver: zodResolver(AddSizeFormSchema),
    });
  
    const router = useRouter();
    const queryClient = useQueryClient();
    const { toast } = useToast();
  
    const { mutate, isLoading, isError } = useMutation({
      mutationFn: addSize,
      onSuccess: () => {
          queryClient.invalidateQueries(["COLOR"])
          toast({title:"Success", variant: "default"})
      },
      onError: (error) =>
        toast({
          title: "Error",
          variant: "destructive",
          description: "Size exists",
        }),
    });
  
    const onSubmit = async (values: z.infer<typeof AddSizeFormSchema>) => {
      mutate({ ...values });
    };
  
    return (
      <div>
        <Button variant="link" className="px-0" onClick={() => router.back()}>
          Back
        </Button>
        <Form {...AddSizeForm}>
          <form
            onSubmit={AddSizeForm.handleSubmit(onSubmit)}
            className="w-1/2 py-4"
          >
            <h4>Basic Information</h4>
            <div className="mt-4 flex flex-col gap-y-4">
              <TextInput name="name" placeholder="UK 10" label="Name" />
            </div>
            <div className="my-4">
              <Button type="submit">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }
  
  export default AddSizeForm;