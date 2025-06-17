"use client";

import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { SelectItem } from "@/components/ui/select";
// import { editProduct, getSubCategoriesForCategory } from "@/lib/api/cloth"; // To be replaced
import { trpc } from "@/lib/providers"; // Import trpc instance
import { useRouter } from "next/navigation"; // For redirect
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // To be replaced
import { useQueryClient } from "@tanstack/react-query"; // Keep for now if any non-trpc mutations remain, or remove if all are trpc
import MediaInput from "@/app/manage/products/components/media-input/media-input";
import NumberInput from "@/app/manage/components/form/number-input";
import SelectInput from "@/app/manage/components/form/select-input";
import TextInput from "@/app/manage/components/form/text-input";
import VariantsInput from "@/app/manage/products/components/variants-input/variants-input";
// import { getCategories } from "@/lib/api/category"; // To be replaced
import ImagesInput from "@/app/manage/components/form/images-input";
import { GetClothFormDTO, EditProductDTO as ServerEditProductDTO } from "@/server/application/common/dtos/cloth"; // Import server DTO for type safety
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import TextAreaInput from "@/app/manage/components/form/text-area-input";
import SwitchInput from "@/app/manage/components/form/checkbox-input";

const EditProductFormSchema = z
.object({
  name: z.string().min(2).max(100),
  sku: z.string().min(2),
  description: z.string().min(10).max(500),
  price: z.number().int().nonnegative(),
  discount: z.number().int().nonnegative().max(100),
  category: z.string({ required_error: "Please select a category" }),
  subcategory: z.string({ required_error: "Please select a category" }),
  enabled:z.boolean(),
  variants: z
    .object({
      color: z.string(),
      size: z.string(),
      stock: z.number().int().nonnegative(),
    })
    .array()
    .nonempty(),
  media: z
    .object({
      color: z.string(),
      images: z
        .string()
        .array()
        .nonempty({ message: "Please upload at least 1 image" }),
      isDefault: z.boolean(),
    })
    .array()
    .nonempty()
    .refine(
      (v) => {
        return (
          !v.every((o) => o.isDefault === false) &&
          v.filter((o) => o.isDefault === true).length === 1
        );
      },
      {
        message: "Please select one default variant",
      }
    )
    .refine(
      (v) => {
        const colors = v.map((m) => m.color);
        return colors.length === new Set(colors).size;
      },
      {
        message: "No duplicates allowed",
      }
    ),
  seo: z.object({
    title: z.string().max(60).optional(),
    description: z.string().max(160).optional(),
    og_title: z.string().optional(),
    og_description: z.string().optional(),
    og_image: z.object({
      image: z.string().array().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      alt: z.string().optional(),
    }),
  }),
})
.superRefine((val, ctx) => {
  const variantColors = [...new Set(val.variants)].map((v) => v.color);
  const mediaColors = val.media.map((v) => v.color);
  function areArraysIdenticalUsingSets(array1: string[], array2: string[]) {
    const set1 = new Set(array1);
    const set2 = new Set(array2);

    // Use the size property to check if sets have the same number of elements
    if (set1.size !== set2.size) {
      return false;
    }

    // Use the spread operator to convert sets to arrays and compare the arrays
    return [...set1].every((element) => set2.has(element));
  }

  if (!areArraysIdenticalUsingSets(variantColors, mediaColors)) {
    ctx.addIssue({
      path: ["media"],
      code: z.ZodIssueCode.custom,
      message: "Please add the same colors as in variants",
    });
  }
});

type EditProductFormProps = { cloth: z.infer<typeof GetClothFormDTO> };

function EditProductForm({ cloth }: EditProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const utils = trpc.useContext();
  // Prop name is 'cloth' but it's a product, renaming for clarity internally
  const product = cloth;

  const form = useForm<z.infer<typeof EditProductFormSchema>>({
    resolver: zodResolver(EditProductFormSchema),
    // Ensure defaultValues correctly map from the product prop
    // The product prop (GetClothFormDTO) might have category/subcategory as objects or just IDs.
    // EditProductFormSchema expects string IDs for category/subcategory.
    defaultValues: {
      ...product,
      category: typeof product.category === 'object' ? product.category?._id : product.category,
      subcategory: typeof product.subcategory === 'object' ? product.subcategory?._id : product.subcategory,
      // variants and media need to be mapped to ensure _id is present if it exists on 'product'
      // This depends on the exact structure of GetClothFormDTO vs EditProductFormSchema/EditProductDTO
      // For simplicity, direct spread might work if structures are aligned or DTOs are robust.
      // variants: product.variants.map(v => ({...v, color: v.color?._id, size: v.size?._id })), // Example if DTO needs mapping
      // media: product.media.map(m => ({...m, color: m.color?._id, images: m.images || []})), // Ensure images is always array
    },
  });

  const { data: categories, isLoading: isCategoriesLoading, error: categoriesError } = trpc.adminCategory.getAll.useQuery();

  const selectedCategory = form.watch("category");

  const { data: subcategories, isLoading: isSubCategoriesLoading, error: subcategoriesError } = trpc.adminSubCategory.getByCategoryId.useQuery(
    { categoryId: selectedCategory },
    { enabled: !!selectedCategory }
  );

  const updateProductMutation = trpc.adminProduct.update.useMutation({
    onSuccess: (data) => {
      utils.adminProduct.getAll.invalidate();
      utils.adminProduct.getById.invalidate({ _id: product._id });
      toast({ title: "Success", description: data.message });
      router.push("/manage/products");
    },
    onError: (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "Error updating product.",
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof EditProductFormSchema>) => {
    // Map form values to ServerEditProductDTO, ensuring _id is at the top level
    const payload: z.infer<typeof ServerEditProductDTO> = {
      _id: product._id, // Ensure _id from the original product prop is used
      name: values.name,
      sku: values.sku,
      enabled: values.enabled,
      description: values.description,
      price: values.price,
      discount: values.discount,
      category: values.category,
      subcategory: values.subcategory,
      variants: values.variants.map(v => ({
        ...v,
        _id: product.variants.find(pv => pv.color === v.color && pv.size === v.size)?._id // Try to find existing variant _id
      })),
      media: values.media.map(m => ({
        ...m,
        _id: product.media.find(pm => pm.color === m.color)?. _id // Try to find existing media _id
      })),
      seo: values.seo,
    };
    updateProductMutation.mutate(payload);
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full lg:w-3/4 xl:w-1/2" // Responsive width
        >
          <h4>Basic Information</h4>
          <div className="flex flex-col gap-y-4">
            <TextInput control={form.control} name="name" placeholder="Frill Dress" label="Name" />
            <TextInput control={form.control} name="sku" placeholder="SKU" label="SKU" />
            <SwitchInput control={form.control} name={`enabled`} label="Enabled" />
            <TextAreaInput
              control={form.control}
              name={"description"}
              label={"Description"}
              placeholder={"lorem ipsum dolor sit amet"}
            />
            <NumberInput control={form.control} name="price" label="Price" />
            <NumberInput control={form.control} name="discount" label="Discount" />

            <SelectInput
              control={form.control}
              disabled={isCategoriesLoading || !!categoriesError}
              name="category"
              placeholder="Select a category"
              label="Category"
            >
              {categoriesError && <p className="text-sm text-destructive">Error loading categories.</p>}
              {categories?.map((el) => (
                <SelectItem key={el._id} value={el._id}>
                  {el.name}
                </SelectItem>
              ))}
            </SelectInput>

            <SelectInput
              control={form.control}
              disabled={isSubCategoriesLoading || !selectedCategory || !!subcategoriesError}
              name="subcategory"
              placeholder="Select a subcategory"
              label="Subcategory"
            >
              {subcategoriesError && <p className="text-sm text-destructive">Error loading subcategories.</p>}
              {subcategories?.map((el) => (
                <SelectItem key={el._id} value={el._id}>
                  {el.name}
                </SelectItem>
              ))}
            </SelectInput>
          </div>
          <div className="mt-8">
            <h4>Variants</h4>
            <div>
              <VariantsInput control={form.control} name="variants" label="Variants" />
            </div>
          </div>
          <div className="mt-8">
            <h4>Media</h4>
            <MediaInput control={form.control} name="media" label="Media" />
          </div>
          <div className="mt-8">
            <h4>SEO</h4>
            <div className="grid gap-y-2">
              <TextInput control={form.control} name="seo.title" placeholder="" label="Title" />
              <TextInput
                control={form.control}
                name="seo.description"
                placeholder=""
                label="Meta Description"
              />
              <TextInput control={form.control} name="seo.og_title" placeholder="" label="OG Title" />
              <TextInput
                control={form.control}
                name="seo.og_description"
                placeholder=""
                label="OG Description"
              />
              <div>
                <h6>OG Image</h6>
                <div className={"grid grid-cols-1 gap-y-4"}>
                  <ImagesInput
                    control={form.control}
                    constrain={1}
                    name="seo.og_image.image"
                    label="Image"
                  />
                  <div className="grid grid-cols-2 gap-x-4 ">
                    <NumberInput control={form.control} name="seo.og_image.width" label="Width" />
                    <NumberInput control={form.control} name="seo.og_image.height" label="height" />
                  </div>
                  <TextInput
                    control={form.control}
                    name={"seo.og_image.alt"}
                    label={"Alternative Text"}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="my-6"> {/* Increased margin */}
            <Button type="submit" disabled={updateProductMutation.isLoading}>
              {updateProductMutation.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
      <DevTool control={form.control} /> {/* Use renamed form instance */}
    </div>
  );
}

export default EditProductForm;
