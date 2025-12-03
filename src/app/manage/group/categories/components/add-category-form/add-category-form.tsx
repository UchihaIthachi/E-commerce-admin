"use client";

import TextInput from "@/app/manage/components/form/text-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
// Remove: import {addCategory} from "@/lib/api/category";
// Remove: import {useMutation, useQueryClient} from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import NumberInput from "../../../../components/form/number-input";
import ImagesInput from "@/app/manage/components/form/images-input";

// Import Server Action and hooks from react-dom
import { createCategoryAction } from "../../actions"; // Adjust path if necessary
// @ts-ignore
import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";

// DTO for client-side form validation, should match AddCategoryDTO structure used in server action
// Note: Server Action will re-validate with AddCategoryDTO. This client schema is for UX.
// The server action's AddCategoryDTO doesn't include og_title, og_description, og_image
// so we need to align this or ensure server action's DTO is comprehensive.
// For now, aligning with the server action's expected AddCategoryDTO (name, slug, seo.title, seo.description)
// If these extra OG fields are needed, the AddCategoryDTO in the server action and its handler must be updated.
const AddCategoryClientSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters.").max(50),
    slug: z
        .string()
        .min(2, "Slug must be at least 2 characters.")
        .max(50)
        .refine((v) => v === v.toLowerCase(), {
            message: "Slugs can't have capital letters",
        })
        .refine((v) => !v.includes(" "), {
            message: "Slugs can't have spaces",
        }),
    "seo.title": z.string().max(60).optional(), // Flattened for FormData compatibility
    "seo.description": z.string().max(160).optional(),
    // The following OG fields are not in the current server-side AddCategoryDTO
    // "seo.og_title": z.string().optional(),
    // "seo.og_description": z.string().optional(),
    // "seo.og_image.image": z.string().array().optional(), // This structure is complex for FormData
    // "seo.og_image.width": z.number().optional(),
    // "seo.og_image.height": z.number().optional(),
    // "seo.og_image.alt": z.string().optional(),
});

// SubmitButton component to use useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        "Save"
      )}
    </Button>
  );
}

const initialState = {
  message: null,
  errors: undefined,
};

function AddCategoryForm() {
    // useForm for client-side validation, but submission handled by server action
    const form = useForm<z.infer<typeof AddCategoryClientSchema>>({
        resolver: zodResolver(AddCategoryClientSchema),
        defaultValues: {
            name: "",
            slug: "",
            "seo.title": "",
            "seo.description": "",
            // seo: {
            //     og_image: {image: []}, // Complex objects like this are tricky with plain FormData
            // },
        }
    });

    const router = useRouter();
    const { toast } = useToast();

    // useFormState for handling server action response
    const [state, formAction] = useFormState(createCategoryAction, initialState);

    // Handle success/error messages from server action
    useEffect(() => {
        if (state?.message) {
            if (state.errors) {
                toast({
                    title: "Error",
                    variant: "destructive",
                    description: state.message,
                });
                // You could also parse state.errors to set form errors with form.setError
                // e.g., for (const [key, value] of Object.entries(state.errors)) {
                //   form.setError(key as any, { type: 'manual', message: value.join(', ') });
                // }
            } else {
                toast({ title: "Success", variant: "default", description: state.message });
                router.push("/manage/group/categories"); // Redirect on success
            }
        }
    }, [state, toast, router, form]);


    // No longer using useMutation for form submission
    // const {mutate, isLoading, isError} = useMutation({ ... });

    // const onSubmit = async (values: z.infer<typeof AddCategoryFormSchema>) => {
    //     mutate({...values});
    // };
    // The form's onSubmit is now implicitly handled by the action prop

    return (
        <div>
            <Button variant="link" className="px-0" onClick={() => router.back()}>
                Back
            </Button>
            {/* Pass formAction to the form's action prop */}
            <Form {...form}> {/* Still use react-hook-form for client validation & structure */}
                <form
                    action={formAction} // Use the server action
                    // onSubmit={form.handleSubmit(onSubmit)} // No longer needed if action is used directly
                    className="w-1/2 py-4"
                >
                    <h4>Basic Information</h4>
                    <div className="mt-4 flex flex-col gap-y-4">
                        {/* Ensure names match FormData keys expected by server action & Zod schema */}
                        <TextInput name="name" placeholder="Women" label="Name"/>
                        <TextInput name="slug" placeholder="women" label="Slug"/>
                    </div>
                    <div className="mt-8">
                        <h4>SEO</h4>
                        <div className="grid gap-y-2">
                            <TextInput name="seo.title" placeholder="" label="Title"/>
                            <TextInput
                                name="seo.description"
                                placeholder=""
                                label="Meta Description"
                            />
                            {/* OG fields are removed for now to align with simpler server AddCategoryDTO */}
                            {/* <TextInput name="seo.og_title" placeholder="" label="OG Title"/>
                            <TextInput
                                name="seo.og_description"
                                placeholder=""
                                label="OG Description"
                            />
                            <div>
                                <h6>OG Image</h6>
                                <div className={"grid grid-cols-1 gap-y-4"}>
                                    <ImagesInput
                                        constrain={1}
                                        name="seo.og_image.image" // Complex field for FormData
                                        label="Image"
                                    />
                                    <div className="grid grid-cols-2 gap-x-4 ">
                                        <NumberInput name="seo.og_image.width" label="Width"/>
                                        <NumberInput name="seo.og_image.height" label="height"/>
                                    </div>
                                    <TextInput name={"seo.og_image.alt"} label={"Alternative Text"}/>
                                </div>
                            </div> */}
                        </div>
                    </div>
                     {state?.errors?._form && (
                        <p className="text-sm font-medium text-destructive">{state.errors._form.join(', ')}</p>
                     )}
                    <div className="my-4">
                        <SubmitButton /> {/* Use the new SubmitButton */}
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default AddCategoryForm;
