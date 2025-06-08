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
import { GetColorDTO } from "@/server/application/common/dtos/color"; // For prop type
import { trpc } from "@/lib/providers"; // Import trpc instance

// Client-side Zod schema, should align with server's EditColorDTO
const EditColorClientSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(50)
    .refine((v) => v === v.toUpperCase(), { // Assuming this validation is still desired
      message: "Color Names must be uppercase.",
    }),
  hex: z
    .string()
    .min(6, "Hex code must be at least 6 characters.")
    .max(50) // Typically 6 characters without #
    .refine((v) => !v.includes("#"), {
      message: "Color Codes should not include the # sign.",
    }),
});

type EditColorFormValues = z.infer<typeof EditColorClientSchema>;

type EditColorFormProps = {
  color: z.infer<typeof GetColorDTO>; // Expect the full color object as a prop
};

function EditColorForm({ color }: EditColorFormProps) {
  const form = useForm<EditColorFormValues>({ // Renamed form instance
    resolver: zodResolver(EditColorClientSchema),
    defaultValues: {
      name: color.name,
      hex: color.hex,
    },
  });

  const router = useRouter();
  const { toast } = useToast();
  const utils = trpc.useContext();

  const updateColorMutation = trpc.adminColor.update.useMutation({
    onSuccess: (data) => {
      utils.adminColor.getAll.invalidate(); // Invalidate list
      utils.adminColor.getById.invalidate({ _id: color._id }); // Invalidate this specific item
      toast({ title: "Success", description: `Color "${data.name}" updated successfully!` });
      router.push("/manage/attributes/colors"); // Navigate back to the list
    },
    onError: (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "Error while updating color. It might be referenced or already exist.",
      });
    },
  });

  const onSubmit = async (values: EditColorFormValues) => {
    updateColorMutation.mutate({ _id: color._id, ...values });
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
          <h4 className="text-lg font-semibold mb-2">Edit Color</h4>
           <p className="text-sm text-muted-foreground mb-4">
            Ensure color names are uppercase (e.g., BLACK) and hex codes are without the '#' symbol (e.g., 000000).
          </p>
          <div className="mt-4 flex flex-col gap-y-4">
            <TextInput control={form.control} name="name" placeholder="BLACK" label="Name" />
            <TextInput control={form.control} name="hex" placeholder="000000" label="Hex Code" />
          </div>
          <div className="my-6"> {/* Increased margin */}
            <Button type="submit" disabled={updateColorMutation.isLoading}>
              {updateColorMutation.isLoading ? (
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

export default EditColorForm;
