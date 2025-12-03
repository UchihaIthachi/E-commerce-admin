"use client";

import TextInput from "@/app/manage/components/form/text-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { GetSizeDTO } from "@/server/application/common/dtos/size"; // For prop type
import { trpc } from "@/lib/providers"; // Import trpc instance

// Client-side Zod schema, should align with server's EditSizeDTO
const EditSizeClientSchema = z.object({
  name: z.string().min(1, "Name is required.").max(50),
  // .refine((v) => v === v.toUpperCase(), { // Example validation, adjust as needed
  //   message: "Size Names should be uppercase.",
  // }),
});

type EditSizeFormValues = z.infer<typeof EditSizeClientSchema>;

type EditSizeFormProps = {
  size: z.infer<typeof GetSizeDTO>; // Expect the full size object as a prop
};

function EditSizeForm({ size }: EditSizeFormProps) {
  const form = useForm<EditSizeFormValues>({ // Renamed form instance
    resolver: zodResolver(EditSizeClientSchema),
    defaultValues: {
      name: size.name,
    },
  });

  const router = useRouter();
  const { toast } = useToast();
  const utils = trpc.useContext();

  const updateSizeMutation = trpc.adminSize.update.useMutation({
    onSuccess: (data) => {
      utils.adminSize.getAll.invalidate(); // Invalidate list
      utils.adminSize.getById.invalidate({ _id: size._id }); // Invalidate this specific item
      toast({ title: "Success", description: `Size "${data.name}" updated successfully!` });
      router.push("/manage/attributes/sizes"); // Navigate back to the list
    },
    onError: (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "Error while updating size. It might be referenced or already exist.",
      });
    },
  });

  const onSubmit = async (values: EditSizeFormValues) => {
    updateSizeMutation.mutate({ _id: size._id, ...values });
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
          <h4 className="text-lg font-semibold mb-2">Edit Size</h4>
          {/* <p className="text-sm text-muted-foreground mb-4">
             Make changes to the size name.
          </p> */}
          <div className="mt-4 flex flex-col gap-y-4">
            <TextInput name="name" placeholder="e.g., S, M, L, UK 10" label="Size Name" />
          </div>
          <div className="my-6"> {/* Increased margin */}
            <Button type="submit" disabled={updateSizeMutation.isLoading}>
              {updateSizeMutation.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default EditSizeForm;
