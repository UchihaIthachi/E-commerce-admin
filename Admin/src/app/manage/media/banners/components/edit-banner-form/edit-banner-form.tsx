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
import { GetBannerDTO } from "@/server/application/common/dtos/banner"; // For prop type
import { useRouter } from "next/navigation"; // For navigation
// Server Action imports
import { updateBannerAction, BannerFormState } from "../../actions"; // Adjust path as needed
import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";

type EditBannerFormProps = {
  banner: z.infer<typeof GetBannerDTO>;
};

// Client-side schema, ensuring image fields expect string URLs
const EditBannerFormClientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name must be at most 50 characters."),
  desktop_image: z.string().url("Desktop image URL is required."),
  mobile_image: z.string().url("Mobile image URL is required."),
});

type EditBannerFormValues = z.infer<typeof EditBannerFormClientSchema>;

const EditBannerForm = ({ banner }: EditBannerFormProps) => {
  const router = useRouter();
  const form = useForm<EditBannerFormValues>({ // Renamed form instance
    resolver: zodResolver(EditBannerFormClientSchema),
    defaultValues: {
      name: banner.name,
      desktop_image: [banner.desktop_image], // ImagesInput expects an array
      mobile_image: [banner.mobile_image],   // ImagesInput expects an array
    },
  });

  const { toast } = useToast();
  // const utils = trpc.useContext(); // Not strictly needed

  const [state, formAction] = useFormState(updateBannerAction, { message: null, errors: undefined, type: null });

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
                    form.setError(key as keyof EditBannerFormValues, { type: 'manual', message: value.join(', ') });
                }
            }
        }
    }
  }, [state, toast, router, form]);

  // As with add form, assuming desktop_image and mobile_image are direct string URL inputs.

  return (
    <Form {...form}>
      <form
        action={formAction} // Use the server action
        // onSubmit={form.handleSubmit(onSubmit)}
        className={"w-full md:w-1/2"}
      >
        <input type="hidden" name="_id" value={banner._id} />
        {/* <h4 className="text-lg font-semibold mb-4">Edit Banner Details</h4> */}
        <div className={"mt-4 flex flex-col gap-y-4"}>
          <TextInput name={"name"} label={"Name"} control={form.control} />
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
      Update Banner
    </Button>
  );
}

export default EditBannerForm;
