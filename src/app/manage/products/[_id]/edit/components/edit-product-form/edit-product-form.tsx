"use client";

import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { SelectItem } from "@/components/ui/select";
import { editProduct, getSubCategoriesForCategory } from "@/lib/api/cloth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MediaInput from "@/app/manage/products/components/media-input/media-input";
import NumberInput from "@/app/manage/components/form/number-input";
import SelectInput from "@/app/manage/components/form/select-input";
import TextInput from "@/app/manage/components/form/text-input";
import VariantsInput from "@/app/manage/products/components/variants-input/variants-input";
import { getCategories } from "@/lib/api/category";
import ImagesInput from "@/app/manage/components/form/images-input";
import { GetClothFormDTO } from "@/server/application/common/dtos/cloth";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const EditProductForm = useForm<z.infer<typeof EditProductFormSchema>>({
    resolver: zodResolver(EditProductFormSchema),
    defaultValues: { ...cloth },
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["CATEGORY"],
    queryFn: getCategories,
  });

  const selectedCategory = EditProductForm.watch("category");

  const { data: subcategories, isLoading: isSubCategoriesLoading } = useQuery({
    queryKey: ["SUBCATEGORY", selectedCategory],
    queryFn: () => getSubCategoriesForCategory(selectedCategory),
    enabled: !!selectedCategory,
  });

  const { mutate: editProductMutate, isLoading: isEditProductLoading } =
    useMutation({
      mutationFn: editProduct,
      onSuccess: () => {
        queryClient.invalidateQueries(["CLOTH", cloth._id]);
        queryClient.invalidateQueries(["CLOTH"]);
        toast({ title: "Success", variant: "default" });
      },
      onError: () => {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Error while editing product",
        });
      },
    });

  const onSubmit = async (values: z.infer<typeof EditProductFormSchema>) => {
    editProductMutate({
      _id: cloth._id,
      product: {
        ...values,
        _id: cloth._id,
        variants: values.variants.map((v, i) => ({
          ...v,
          _id: cloth.variants[i]?._id,
        })),
        media: values.media.map((v, i) => ({ ...v, _id: cloth.media[i]?._id })),
      },
    });
  };

  return (
    <div>
      <Form {...EditProductForm}>
        <form
          onSubmit={EditProductForm.handleSubmit(onSubmit)}
          className="w-1/2"
        >
          <h4>Basic Information</h4>
          <div className="flex flex-col gap-y-4">
            <TextInput name="name" placeholder="Frill Dress" label="Name" />
            <TextInput name="sku" placeholder="SKU" label="SKU" />
            <SwitchInput name={`enabled`} label="Enabled" />            
            <TextAreaInput
              name={"description"}
              label={"Description"}
              placeholder={"lorem ipsum dolor sit amet"}
            />
            <NumberInput name="price" label="Price" />
            <NumberInput name="discount" label="Discount" />

            <SelectInput
              disabled={isCategoriesLoading}
              name="category"
              placeholder="Select a category"
              label="Category"
            >
              {categories?.map((el) => (
                <SelectItem key={el._id} value={el._id}>
                  {el.name}
                </SelectItem>
              ))}
            </SelectInput>

            <SelectInput
              disabled={isSubCategoriesLoading}
              name="subcategory"
              placeholder="Select a subcategory"
              label="Subcategory"
            >
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
              <VariantsInput name="variants" label="Variants" />
            </div>
          </div>
          <div className="mt-8">
            <h4>Media</h4>
            <MediaInput name="media" label="Media" />
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
              <TextInput name="seo.og_title" placeholder="" label="OG Title" />
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
                    name="seo.og_image.image"
                    label="Image"
                  />
                  <div className="grid grid-cols-2 gap-x-4 ">
                    <NumberInput name="seo.og_image.width" label="Width" />
                    <NumberInput name="seo.og_image.height" label="height" />
                  </div>
                  <TextInput
                    name={"seo.og_image.alt"}
                    label={"Alternative Text"}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="my-4">
            <Button type="submit">
              {isEditProductLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
      <DevTool control={EditProductForm.control} />
    </div>
  );
}

export default EditProductForm;
