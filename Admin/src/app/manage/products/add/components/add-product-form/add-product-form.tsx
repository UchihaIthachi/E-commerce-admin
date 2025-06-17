"use client";

import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { SelectItem } from "@/components/ui/select";
// import { addProduct } from "@/lib/api/cloth"; // To be replaced by tRPC mutation
// import { useMutation, useQueryClient } from "@tanstack/react-query"; // To be replaced by tRPC hooks
import { trpc } from "@/lib/providers"; // Import trpc instance
import { useRouter } from "next/navigation"; // For redirect
import MediaInput from "../../../components/media-input/media-input";
import NumberInput from "../../../../components/form/number-input";
import SelectInput from "@/app/manage/components/form/select-input";
import TextInput from "@/app/manage/components/form/text-input";
import VariantsInput from "@/app/manage/products/components/variants-input/variants-input";
// import { getCategories } from "@/lib/api/category"; // No longer needed
import ImagesInput from "@/app/manage/components/form/images-input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import TextAreaInput from "@/app/manage/components/form/text-area-input";
import SwitchInput from "@/app/manage/components/form/checkbox-input";
import FormSection from '@/app/manage/components/form/FormSection'; // Import FormSection

const AddProductFormSchema = z
  .object({
    name: z.string().min(2).max(100),
    sku: z.string().min(2),
    description: z.string().min(10).max(500),
    price: z.number().int().nonnegative(),
    discount: z.number().int().nonnegative().max(100),
    category: z.string({ required_error: "Please select a category" }),
    subcategory: z.string({ required_error: "Please select a category" }),
    enabled: z.boolean(),
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
    console.log("variant", variantColors);
    console.log("media", mediaColors);
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

    console.log(areArraysIdenticalUsingSets(variantColors, mediaColors));
    if (!areArraysIdenticalUsingSets(variantColors, mediaColors)) {
      ctx.addIssue({
        path: ["media"],
        code: z.ZodIssueCode.custom,
        message: "Please add the same colors as in variants",
      });
    }
  });

function AddProductForm() {
  const form = useForm<z.infer<typeof AddProductFormSchema>>({ // Renamed AddProductForm to form
    resolver: zodResolver(AddProductFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      price: 0,
      enabled: true,
      discount: 0,
      variants: [],
      media: [],
      seo: {
        title: "",
        description: "",
        og_title: "",
        og_description: "",
        og_image: { image: [] },
      },
    },
  });

  const router = useRouter();
  const { toast } = useToast();
  const utils = trpc.useContext();

  const { data: categories, isLoading: isCategoriesLoading, error: categoriesError } = trpc.adminCategory.getAll.useQuery();

  const selectedCategory = form.watch("category");

  const { data: subcategories, isLoading: isSubCategoriesLoading, error: subcategoriesError } = trpc.adminSubCategory.getByCategoryId.useQuery(
    { categoryId: selectedCategory },
    { enabled: !!selectedCategory }
  );

  const createProductMutation = trpc.adminProduct.create.useMutation({
    onSuccess: (data) => {
      utils.adminProduct.getAll.invalidate();
      toast({ title: "Success", description: data.message });
      router.push("/manage/products");
    },
    onError: (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "Error creating product.",
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof AddProductFormSchema>) => {
    createProductMutation.mutate(values);
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full lg:w-3/4 xl:w-1/2"
        >
          <FormSection title="Basic Information" className="mt-0">
            <div className="flex flex-col gap-y-4">
              <TextInput control={form.control} name="name" placeholder="Frill Dress" label="Name" />
              <TextInput control={form.control} name="sku" placeholder="SKU" label="SKU" />
              <SwitchInput control={form.control} name={`enabled`} label="Enabled" />
            <TextAreaInput
              control={form.control} // Ensure consistency: use 'form.control'
              name={"description"}
              label={"Description"}
              placeholder={"lorem ipsum dolor sit amet"}
            />
            <NumberInput control={AddProductForm.control} name="price" label="Price" />
            <NumberInput control={AddProductForm.control} name="discount" label="Discount %" />

            <SelectInput
              control={AddProductForm.control}
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
              control={AddProductForm.control}
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
          </FormSection>

          <FormSection title="Variants">
            <div>
              <VariantsInput control={AddProductForm.control} name="variants" label="Variants" />
            </div>
          </FormSection>

          <FormSection title="Media">
            {/* The MediaInput component likely has its own internal padding/margins for its label if FormSection's default div mt-4 is too much. Or adjust MediaInput. */}
            <MediaInput control={AddProductForm.control} name="media" label="Media" />
          </FormSection>

          <FormSection title="SEO">
            <div className="grid gap-y-2">
              <TextInput control={AddProductForm.control} name="seo.title" placeholder="" label="Title" />
              <TextInput
                control={AddProductForm.control}
                name="seo.description"
                placeholder=""
                label="Meta Description"
              />
              <TextInput control={AddProductForm.control} name="seo.og_title" placeholder="" label="OG Title" />
              <TextInput
                control={AddProductForm.control}
                name="seo.og_description"
                placeholder=""
                label="OG Description"
              />
              <div>
                <h5>OG Image</h5>
                <div className={"grid grid-cols-1 gap-y-4"}>
                  <ImagesInput
                    control={AddProductForm.control}
                    constrain={1}
                    name="seo.og_image.image"
                    label="Image"
                  />
                  <div className="grid grid-cols-2 gap-x-4 ">
                    <NumberInput control={AddProductForm.control} name="seo.og_image.width" label="Width" />
                    <NumberInput control={AddProductForm.control} name="seo.og_image.height" label="height" />
                  </div>
                  <TextInput
                    control={AddProductForm.control}
                    name={"seo.og_image.alt"}
                    label={"Alternative Text"}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Button type="submit" disabled={createProductMutation.isPending}> {/* Use isPending */}
              {createProductMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </Form>
      {/* <DevTool control={form.control} /> */} {/* Ensure consistency: use 'form.control' */}
    </div>
  );
}

export default AddProductForm;
