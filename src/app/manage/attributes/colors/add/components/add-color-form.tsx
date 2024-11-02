import TextInput from "@/app/manage/components/form/text-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { addColor } from "@/lib/api/color";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AddColorFormSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .refine((v) => v === v.toUpperCase(), {
      message: "Color Names can't have simple letters",
    }),
  hex: z
    .string()
    .min(6)
    .max(50)
    .refine((v) => !v.includes("#"), {
      message: "Color Codes can't have # sign",
    }),
});

function AddColorForm() {
  const AddColorForm = useForm<z.infer<typeof AddColorFormSchema>>({
    resolver: zodResolver(AddColorFormSchema),
  });

  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate, isLoading, isError } = useMutation({
    mutationFn: addColor,
    onSuccess: () => {
        queryClient.invalidateQueries(["COLOR"])
        toast({title:"Success", variant: "default"})
    },
    onError: (error) =>
      toast({
        title: "Error",
        variant: "destructive",
        description: "Color exists",
      }),
  });

  const onSubmit = async (values: z.infer<typeof AddColorFormSchema>) => {
    mutate({ ...values });
  };

  return (
    <div>
      <Button variant="link" className="px-0" onClick={() => router.back()}>
        Back
      </Button>
      <Form {...AddColorForm}>
        <form
          onSubmit={AddColorForm.handleSubmit(onSubmit)}
          className="w-1/2 py-4"
        >
          <h4>Basic Information</h4>
          <div className="mt-4 flex flex-col gap-y-4">
            <TextInput name="name" placeholder="BLACK" label="Name" />
            <TextInput name="hex" placeholder="000000" label="Hex" />
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

export default AddColorForm;
