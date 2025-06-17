"use client";

import SelectInput from "@/app/manage/components/form/select-input";
import TextInput from "@/app/manage/components/form/text-input";
import {Button} from "@/components/ui/button";
import {Form} from "@/components/ui/form";
import {SelectItem} from "@/components/ui/select";
import {useToast} from "@/components/ui/use-toast";
// import {getCategories} from "@/lib/api/category"; // No longer needed
// import {addSubcategory} from "@/lib/api/subcategory"; // No longer needed
import {zodResolver} from "@hookform/resolvers/zod";
// import { trpc } from "@/lib/providers"; // No longer using tRPC mutation for create
import {Loader2} from "lucide-react";
import {useRouter} from "next/navigation";
// Server Action imports
import { createSubcategoryAction, FormState } from "../../actions"; // Adjust path as needed
import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import NumberInput from "../../../../components/form/number-input";
import ImagesInput from "@/app/manage/components/form/images-input";

const AddSubCategoryFormSchema = z.object({
    name: z.string().min(2).max(50),
    slug: z
        .string()
        .min(2)
        .max(50)
        .refine((v) => v === v.toLowerCase(), {
            message: "Slugs can't have capital letters",
        })
        .refine((v) => !v.includes(" "), {
            message: "Slugs can't have spaces",
        }),
    category: z.string({required_error: "Please select a category."}),
    // Flattened SEO fields for FormData, matching Server Action schema
    "seo.title": z.string().max(60).optional().nullable(),
    "seo.description": z.string().max(160).optional().nullable(),
});

// SubmitButton component to use useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : null}
      Save Subcategory
    </Button>
  );
}

const initialState: FormState = {
  message: null,
  errors: undefined,
  type: null,
};

function AddSubCategoryForm() {
    const form = useForm<z.infer<typeof AddSubCategoryFormSchema>>({
        resolver: zodResolver(AddSubCategoryFormSchema),
        defaultValues: {
            name: "",
            slug: "",
            category: undefined,
            "seo.title": "",
            "seo.description": "",
        }
    });

    const router = useRouter();
    const {toast} = useToast();
    // const utils = trpc.useContext(); // Keep if tRPC queries need invalidation from here, though revalidatePath in action should handle it.

    // Still using tRPC to fetch categories for the select dropdown
    const {data: categories, isLoading: isCategoriesLoading, error: categoriesError} = trpc.adminCategory.getAll.useQuery();

    const [state, formAction] = useFormState(createSubcategoryAction, initialState);

    useEffect(() => {
        if (state?.type === "success") {
            toast({ title: "Success", description: state.message });
            router.push("/manage/group/subcategories");
        } else if (state?.type === "error") {
            toast({
                title: "Error",
                variant: "destructive",
                description: state.message,
            });
            // Set form errors from server action response
            if (state.errors) {
                for (const [key, value] of Object.entries(state.errors)) {
                    if (value && value.length > 0) {
                         form.setError(key as keyof z.infer<typeof AddSubCategoryFormSchema>, { type: 'manual', message: value.join(', ') });
                    }
                }
            }
        }
    }, [state, toast, router, form]);

    // onSubmit is now handled by the form's action prop
    // const onSubmit = async (values: z.infer<typeof AddSubCategoryFormSchema>) => { ... };

    return (
        <div>
            <Button variant="link" className="px-0" onClick={() => router.back()}>
                Back
            </Button>
            <Form {...form}>
                <form
                    action={formAction} // Use the server action
                    // onSubmit={form.handleSubmit(onSubmit)} // react-hook-form handleSubmit is not used when action prop is present
                    className="w-full lg:w-3/4 xl:w-1/2 py-4"
                >
                    <h4>Basic Information</h4>
                    <div className="mt-4 flex flex-col gap-y-4">
                        <TextInput control={form.control} name="name" placeholder="e.g., T-Shirts" label="Name"/>
                        <TextInput control={form.control} name="slug" placeholder="e.g., t-shirts" label="Slug"/>
                        <SelectInput
                            control={form.control}
                            disabled={isCategoriesLoading || !!categoriesError}
                            name="category"
                            label="Category"
                            placeholder="Select a category"
                        >
                            {categoriesError && <p className="text-sm text-destructive">Error loading categories.</p>}
                            {categories?.map((el) => (
                                <SelectItem key={el._id} value={el._id}>
                                    {el.name}
                                </SelectItem>
                            ))}
                        </SelectInput>
                    </div>
                    <div className="mt-8">
                        <h4>SEO</h4>
                        <div className="grid gap-y-2">
                            {/* Names for SEO fields are now flattened e.g. "seo.title" */}
                            <TextInput control={form.control} name="seo.title" placeholder="SEO Title" label="Title"/>
                            <TextInput
                                control={form.control}
                                name="seo.description"
                                placeholder="SEO Meta Description"
                                label="Meta Description"
                            />
                        </div>
                    </div>
                    {state?.errors?._form && (
                        <p className="text-sm font-medium text-destructive pt-2">{state.errors._form.join(', ')}</p>
                     )}
                    <div className="my-6"> {/* Increased margin */}
                        <SubmitButton />
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default AddSubCategoryForm;
