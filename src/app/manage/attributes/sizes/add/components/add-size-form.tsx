import TextInput from "@/app/manage/components/form/text-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { trpc } from "@/lib/providers"; // Import trpc instance

// Client-side Zod schema, should align with server's AddSizeDTO
const AddSizeClientSchema = z.object({
  name: z.string().min(1, "Name is required.").max(50)
  // .refine((v) => v === v.toUpperCase(), { // Example validation, adjust as needed
  //   message: "Size Names should be uppercase.",
  // }),
});

type AddSizeFormValues = z.infer<typeof AddSizeClientSchema>;

function AddSizeForm() {
  const form = useForm<AddSizeFormValues>({ // Renamed form instance
    resolver: zodResolver(AddSizeClientSchema),
    defaultValues: {
      name: "",
    },
  });

  const router = useRouter();
  const { toast } = useToast();
  const utils = trpc.useContext();

  const createSizeMutation = trpc.adminSize.create.useMutation({
    onSuccess: (data) => {
      utils.adminSize.getAll.invalidate(); // Invalidate cache for size list
      toast({ title: "Success", description: `Size "${data.name}" created successfully!` });
      router.push("/manage/attributes/sizes"); // Navigate back to the list
    },
    onError: (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "Error while adding size. It might already exist.",
      });
    },
  });

  const onSubmit = async (values: AddSizeFormValues) => {
    createSizeMutation.mutate(values);
  };

  return (
    <div>
      <Button variant="link" className="px-0" onClick={() => router.back()}>
        Back
      </Button>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full md:w-1/2 py-4" // Responsive width
        >
          <h4 className="text-lg font-semibold mb-2">Add New Size</h4>
          {/* Optional: Add a small description if needed */}
          {/* <p className="text-sm text-muted-foreground mb-4">
            Enter the name for the new size (e.g., S, M, L, UK 10).
          </p> */}
          <div className="mt-4 flex flex-col gap-y-4">
            <TextInput control={form.control} name="name" placeholder="e.g., S, M, L, UK 10" label="Size Name" />
          </div>
          <div className="my-6"> {/* Increased margin */}
            <Button type="submit" disabled={createSizeMutation.isLoading}>
              {createSizeMutation.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Size
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default AddSizeForm;