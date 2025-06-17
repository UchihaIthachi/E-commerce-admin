"use client";

import TextInput from "@/app/manage/components/form/text-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
// import { getCategories } from "@/lib/api/category"; // No longer needed
import { zodResolver } from "@hookform/resolvers/zod";
// import { trpc } from "@/lib/providers"; // No longer using tRPC mutation
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
// Server Action imports
import { updateSubcategoryAction, FormState } from "../../actions"; // Adjust path as needed
import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { GetSubCategoryDTO } from "@/server/application/common/dtos/subcategory";
import SelectInput from "@/app/manage/components/form/select-input";
import { SelectItem } from "@/components/ui/select";
// import { updateSubCategory } from "@/lib/api/subcategory"; // No longer needed
import NumberInput from "../../../../components/form/number-input";
import ImagesInput from "@/app/manage/components/form/images-input";

const EditSubCategoryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters.")
    .max(50, "Slug must be at most 50 characters.")
    .refine((v) => v === v.toLowerCase(), {
      message: "Slugs can't have capital letters",
    })
    .refine((v) => !v.includes(" "), {
      message: "Slugs can't have spaces",
    }),
  category: z.string({ required_error: "Please select a category." }),
  // Flattened SEO fields for FormData
  "seo.title": z.string().max(60).optional().nullable(),
  "seo.description": z.string().max(160).optional().nullable(),
});

// SubmitButton component
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : null}
      Save Changes
    </Button>
  );
}

const initialState: FormState = {
  message: null,
  errors: undefined,
  type: null,
};

function EditSubCategoryForm({
  subcategory,
}: {
  subcategory: z.infer<typeof GetSubCategoryDTO>;
}) {
  const form = useForm<
    z.infer<typeof EditSubCategoryFormSchema>
  >({
    resolver: zodResolver(EditSubCategoryFormSchema),
    defaultValues: {
      name: subcategory.name || "",
      slug: subcategory.slug || "",
      category: subcategory.category._id,
      "seo.title": subcategory.seo?.title || "",
      "seo.description": subcategory.seo?.description || "",
    },
  });

  const router = useRouter();
  const { toast } = useToast();
  // const utils = trpc.useContext(); // Keep if tRPC queries need invalidation from here

  // Still using tRPC to fetch categories for the select dropdown
  const { data: categories, isLoading: isCategoriesLoading, error: categoriesError } = trpc.adminCategory.getAll.useQuery();

  const [state, formAction] = useFormState(updateSubcategoryAction, initialState);

  useEffect(() => {
    if (state?.type === "success") {
        toast({ title: "Success", description: state.message });
        // No redirect here, allow user to make further edits or navigate away manually
        // Could invalidate specific queries if needed using utils.adminSubCategory.getById.invalidate({_id: subcategory._id});
    } else if (state?.type === "error") {
        toast({
            title: "Error",
            variant: "destructive",
            description: state.message,
        });
        if (state.errors) {
            for (const [key, value] of Object.entries(state.errors)) {
                 if (value && value.length > 0) {
                    form.setError(key as keyof z.infer<typeof EditSubCategoryFormSchema>, { type: 'manual', message: value.join(', ') });
                }
            }
        }
    }
  }, [state, toast, form, subcategory._id]); // Added subcategory._id to deps for potential future use with invalidate

  // onSubmit is now handled by the form's action prop
  // const onSubmit = async (values: z.infer<typeof EditSubCategoryFormSchema>) => { ... };

  return (
    <div>
      <Button variant="link" className="px-0" onClick={() => router.back()}>
        Back
      </Button>
      <Form {...form}>
        <form
          action={formAction} // Use the server action
          // onSubmit={form.handleSubmit(onSubmit)}
          className="w-full lg:w-3/4 xl:w-1/2 py-4"
        >
          {/* Hidden input for the subcategory ID */}
          <input type="hidden" name="_id" value={subcategory._id} />

          <h4>Basic Information</h4>
          <div className="mt-4 flex flex-col gap-y-4">
            <TextInput control={form.control} name="name" placeholder="e.g., T-Shirts" label="Name" />
            <TextInput control={form.control} name="slug" placeholder="e.g., t-shirts" label="Slug" />
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
          <div className="my-6">
            <SubmitButton />
          </div>
        </form>
      </Form>
    </div>
  );
}

export default EditSubCategoryForm;
