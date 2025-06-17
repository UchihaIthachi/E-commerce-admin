import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import TextInput from "@/app/manage/components/form/text-input";
import ImagesInput from "@/app/manage/components/form/images-input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DevTool } from "@hookform/devtools";
// import { trpc } from "@/lib/providers"; // No longer using tRPC mutation
import { useRouter } from "next/navigation"; // For navigation
// Server Action imports
import { createBannerAction, BannerFormState } from "../../actions"; // Adjust path as needed
import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";

// Client-side schema for react-hook-form, images are still arrays for ImagesInput
// Server Action will expect single string URLs after client-side processing (if any) or direct URL input.
// For FormData, we'll pass the string URLs directly.
const AddBannerFormClientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name must be at most 50 characters."),
  // These will be single string URL inputs, not file arrays, as per BannerFormSchema in actions.ts
  desktop_image: z.string().url("Desktop image URL is required."),
  mobile_image: z.string().url("Mobile image URL is required.")
});

type AddBannerFormValues = z.infer<typeof AddBannerFormClientSchema>;

const AddBannerForm = () => {
  const router = useRouter();
  const form = useForm<AddBannerFormValues>({ // Renamed form instance
    resolver: zodResolver(AddBannerFormClientSchema),
    defaultValues: {
      name: "",
      desktop_image: [],
      mobile_image: [],
    },
  });

  const { toast } = useToast();
  // const utils = trpc.useContext(); // Not strictly needed if revalidatePath is effective

  const [state, formAction] = useFormState(createBannerAction, { message: null, errors: undefined, type: null });

  useEffect(() => {
    if (state?.type === "success") {
        toast({ title: "Success", description: state.message });
        router.push("/manage/media/banners");
    } else if (state?.type === "error") {
        toast({
            title: "Error",
            variant: "destructive",
            description: state.message,
        });
        if (state.errors) {
            for (const [key, value] of Object.entries(state.errors)) {
                if (value && value.length > 0) {
                    form.setError(key as keyof AddBannerFormValues, { type: 'manual', message: value.join(', ') });
                }
            }
        }
    }
  }, [state, toast, router, form]);

  // onSubmit is now handled by the form's action prop if not using form.handleSubmit with a custom handler
  // For direct form action, we don't need a separate onSubmit handler that calls mutate.
  // However, if ImagesInput still returns arrays and needs client-side processing to get string URLs,
  // we might need form.handleSubmit to intercept, process, then manually create FormData.
  // Assuming ImagesInput is now a simple text input for URL or has been adapted.
  // For this refactor, let's assume desktop_image and mobile_image are direct string URL inputs.
  // If ImagesInput still provides File objects or data URLs, this needs more complex handling.
  // The BannerFormSchema in actions.ts expects string URLs.

  return (
    <Form {...form}>
      <form
        action={formAction} // Use the server action
        // onSubmit={form.handleSubmit(onSubmit)} // Remove if passing data directly via FormData
        className={"w-full md:w-1/2"}
      >
        <h4 className="text-lg font-semibold mb-4">Add New Banner</h4>
        <div className={"mt-4 flex flex-col gap-y-4"}>
          <TextInput name={"name"} label={"Name"} control={form.control} />
          {/* Assuming ImagesInput has been simplified or replaced by TextInput for URL input */}
          {/* If ImagesInput is used for actual file upload and then URL is set, that's a different flow */}
          <TextInput name={"desktop_image"} label={"Desktop Image URL"} control={form.control} placeholder="https://example.com/desktop.jpg"/>
          <TextInput name={"mobile_image"} label={"Mobile Image URL"} control={form.control} placeholder="https://example.com/mobile.jpg"/>
           {state?.errors?.desktop_image && <p className="text-sm font-medium text-destructive">{state.errors.desktop_image.join(', ')}</p>}
           {state?.errors?.mobile_image && <p className="text-sm font-medium text-destructive">{state.errors.mobile_image.join(', ')}</p>}
        </div>
        {state?.errors?._form && (
            <p className="text-sm font-medium text-destructive pt-2">{state.errors._form.join(', ')}</p>
        )}
        <div className="my-6">
          <SubmitButton />
        </div>
      </form>
      <DevTool control={form.control} />
    </Form>
  );
};

// SubmitButton component to use useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : null}
      Submit
    </Button>
  );
}

export default AddBannerForm;
