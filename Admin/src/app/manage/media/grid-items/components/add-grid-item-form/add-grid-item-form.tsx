import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import TextInput from "@/app/manage/components/form/text-input";
import ImagesInput from "@/app/manage/components/form/images-input";
import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";
// import {useMutation, useQueryClient} from "@tanstack/react-query"; // No longer needed
import {useToast} from "@/components/ui/use-toast";
import {DevTool} from "@hookform/devtools";
import NumberInput from "@/app/manage/components/form/number-input";
// import {addGridItem} from "@/lib/api/grid-item"; // No longer needed
// import { trpc } from "@/lib/providers"; // No longer using tRPC mutation
import { useRouter } from "next/navigation"; // For navigation
// Server Action imports
import { createGridItemAction, GridItemFormState } from "../../actions";
import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";

const AddGridItemFormSchema = z.object({
    index: z.coerce.number().int("Index must be an integer.").min(0, "Index must be non-negative."),
    name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name must be at most 50 characters."),
    // Assuming image input will now be a string URL, not a file array from ImagesInput
    image: z.string().url("Image URL is required."),
    link: z.string().url("Please enter a valid URL.")
});

const AddGridItemForm = () => {
    const router = useRouter();
    const form = useForm<z.infer<typeof AddGridItemFormSchema>>({ // Renamed form instance
            resolver: zodResolver(AddGridItemFormSchema),
            defaultValues: {
                index: undefined, // Or a sensible default like 1
                name: "",
                image: [],
                link: ""
            }
        })
    ;

    const {toast} = useToast();
    // const utils = trpc.useContext(); // Not needed for Server Action invalidation if revalidatePath is used

    const [state, formAction] = useFormState(createGridItemAction, { message: null, errors: undefined, type: null });

    useEffect(() => {
        if (state?.type === "success") {
            toast({ title: "Success", description: state.message });
            router.push("/manage/media/grid-items");
        } else if (state?.type === "error") {
            toast({
                title: "Error",
                variant: "destructive",
                description: state.message,
            });
            if (state.errors) {
                for (const [key, value] of Object.entries(state.errors)) {
                    if (value && value.length > 0) {
                        form.setError(key as keyof z.infer<typeof AddGridItemFormSchema>, { type: 'manual', message: value.join(', ') });
                    }
                }
            }
        }
    }, [state, toast, router, form]);

    // The ImagesInput component handles uploads and sets a URL string.
    // If it sets an array, the schema and submission need adjustment.
    // Assuming it now correctly sets a string URL to the 'image' field.

    return (
        <Form {...form}>
            <form
                action={formAction}
                className={"w-full md:w-1/2"}
            >
                <h4 className="text-lg font-semibold mb-4">Add New Grid Item</h4>
                <div className={"mt-4 flex flex-col gap-y-4"}>
                    <NumberInput name={"index"} label={"Index"} control={form.control}/>
                    <TextInput name={"name"} label={"Name"} control={form.control}/>
                    {/* If ImagesInput is used, it should now populate 'image' field with a single URL string */}
                    <ImagesInput
                        constrain={1}
                        name="image" // This should now be a string field for the URL from ImagesInput
                        label="Image"
                        control={form.control}
                    />
                    {/* Or, if ImagesInput was replaced by simple text input for URL:
                    <TextInput name={"image"} label={"Image URL"} control={form.control} placeholder="https://example.com/image.jpg"/>
                    */}
                    {state?.errors?.image && <p className="text-sm font-medium text-destructive">{state.errors.image.join(', ')}</p>}
                    <TextInput name={"link"} label={"Link"} control={form.control} placeholder="https://example.com/link"/>
                    {state?.errors?.link && <p className="text-sm font-medium text-destructive">{state.errors.link.join(', ')}</p>}
                </div>
                 {state?.errors?._form && (
                    <p className="text-sm font-medium text-destructive pt-2">{state.errors._form.join(', ')}</p>
                 )}
                <div className="my-6">
                    <SubmitButton />
                </div>
            </form>
            <DevTool control={form.control}/>
        </Form>
    );
};

// SubmitButton component to use useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2"/>
      ) : null}
      Submit
    </Button>
  );
}

export default AddGridItemForm;
