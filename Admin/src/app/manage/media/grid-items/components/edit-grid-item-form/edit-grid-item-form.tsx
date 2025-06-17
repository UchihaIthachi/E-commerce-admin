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
import {GetGridItemDTO} from "@/server/application/common/dtos/grid-item";
import NumberInput from "@/app/manage/components/form/number-input";
// import {updateGridItem} from "@/lib/api/grid-item"; // No longer needed
// import { trpc } from "@/lib/providers"; // No longer using tRPC mutation
import { useRouter } from "next/navigation"; // For navigation
// Server Action imports
import { updateGridItemAction, GridItemFormState } from "../../actions";
import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";

type EditGridItemFormProps = {
    grid_item: z.infer<typeof GetGridItemDTO>;
}

const EditGridItemFormSchema = z.object({
    index: z.coerce.number().int("Index must be an integer.").min(0, "Index must be non-negative."),
    name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name must be at most 50 characters."),
    image: z.string().url("Image URL is required."), // Expecting a string URL
    link: z.string().url("Please enter a valid URL.")
});

const EditGridItemForm = ({grid_item}: EditGridItemFormProps) => {
    const router = useRouter();
    const form = useForm<z.infer<typeof EditGridItemFormSchema>>({ // Renamed form instance
            resolver: zodResolver(EditGridItemFormSchema),
            defaultValues: {
                index: grid_item.index,
                name: grid_item.name,
                image: [grid_item.image], // ImagesInput expects an array
                link: grid_item.link
            }
        })
    ;

    const {toast} = useToast();
    // const utils = trpc.useContext(); // Not needed for Server Action invalidation

    const [state, formAction] = useFormState(updateGridItemAction, { message: null, errors: undefined, type: null });

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
                        form.setError(key as keyof z.infer<typeof EditGridItemFormSchema>, { type: 'manual', message: value.join(', ') });
                    }
                }
            }
        }
    }, [state, toast, router, form]);

    // Assuming ImagesInput now provides a string URL for the 'image' field.

    return (
        <Form {...form}>
            <form
                action={formAction}
                className={"w-full md:w-1/2"}
            >
                <input type="hidden" name="_id" value={grid_item._id} />
                <h4 className="text-lg font-semibold mb-4">Edit Grid Item</h4>
                <div className={"mt-4 flex flex-col gap-y-4"}>
                    <NumberInput name={"index"} label={"Index"} control={form.control}/>
                    <TextInput name={"name"} label={"Name"} control={form.control}/>
                    <ImagesInput
                        constrain={1}
                        name="image" // Expects this field to be a string URL now
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
      Update Grid Item
    </Button>
  );
}

export default EditGridItemForm;
