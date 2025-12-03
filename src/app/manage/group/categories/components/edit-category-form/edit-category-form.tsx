"use client";

import TextInput from "@/app/manage/components/form/text-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
// Remove: import { updateCategory } from "@/lib/api/category";
// Remove: import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { GetCategoryDTO } from "@/server/application/common/dtos/category"; // Keep this for prop type
import NumberInput from "../../../../components/form/number-input";
import ImagesInput from "@/app/manage/components/form/images-input";

// Import Server Action and hooks from react-dom
import { updateCategoryAction } from "../../actions"; // Adjust path if necessary
// @ts-ignore
import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";

// Client-side Zod schema for form validation.
// Align with EditCategoryDTO and how FormData will be structured.
// Similar to AddCategoryForm, OG image fields are commented out for now.
const EditCategoryClientSchema = z.object({
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
  "seo.title": z.string().max(60).optional(),
  "seo.description": z.string().max(160).optional(),
  // "seo.og_title": z.string().optional(),
  // "seo.og_description": z.string().optional(),
  // "seo.og_image.image": z.string().array().optional(),
  // "seo.og_image.width": z.number().optional(),
  // "seo.og_image.height": z.number().optional(),
  // "seo.og_image.alt": z.string().optional(),
});

// Type for the props, ensuring category is always defined when form is rendered
type EditCategoryFormProps = {
  category: z.infer<typeof GetCategoryDTO>; // Category should be loaded by parent page
};

// SubmitButton component
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        "Save Changes"
      )}
    </Button>
  );
}

const initialState = {
  message: null,
  errors: undefined,
};

function EditCategoryForm({ category }: EditCategoryFormProps) {
  // category prop is now guaranteed to be defined by the parent page's loading logic

  const form = useForm<z.infer<typeof EditCategoryClientSchema>>({
    resolver: zodResolver(EditCategoryClientSchema),
    defaultValues: {
      name: category.name || "",
      slug: category.slug || "",
      "seo.title": category.seo?.title || "",
      "seo.description": category.seo?.description || "",
      // seo: category.seo || { og_image: { image: [] } }, // Defaulting complex objects
    },
  });

  const router = useRouter();
  const { toast } = useToast();

  const [state, formAction] = useFormState(updateCategoryAction, initialState);

  useEffect(() => {
    if (state?.message) {
      if (state.errors) {
        toast({
          title: "Error",
          variant: "destructive",
          description: state.message,
        });
      } else {
        toast({ title: "Success", variant: "default", description: state.message });
        // Optionally redirect or indicate success. Revalidation is handled by the server action.
        // router.push("/manage/group/categories");
      }
    }
  }, [state, toast, router]);

  return (
    <div>
      <Button variant="link" className="px-0" onClick={() => router.back()}>
        Back
      </Button>
      <Form {...form}>
        <form
          action={formAction}
          className="w-1/2 py-4"
        >
          {/* Hidden input for the category ID */}
          <input type="hidden" name="_id" value={category._id} />

          <h4>Basic Information</h4>
          <div className="mt-4 flex flex-col gap-y-4">
            <TextInput name="name" placeholder="Women" label="Name" />
            <TextInput name="slug" placeholder="women" label="Slug" />
          </div>
          <div className="mt-8">
            <h4>SEO</h4>
            <div className="grid gap-y-2">
              <TextInput name="seo.title" placeholder="" label="Title" />
              <TextInput
                name="seo.description"
                placeholder=""
                label="Meta Description"
              />
              {/* OG fields commented out for consistency with Add form and server action DTO */}
            </div>
          </div>
          {state?.errors?._form && (
            <p className="text-sm font-medium text-destructive">{state.errors._form.join(', ')}</p>
          )}
          <div className="my-4">
            <SubmitButton />
          </div>
        </form>
      </Form>
    </div>
  );
}

export default EditCategoryForm;
