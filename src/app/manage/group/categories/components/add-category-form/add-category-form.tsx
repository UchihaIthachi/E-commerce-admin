"use client";

import TextInput from "@/app/manage/components/form/text-input";
import {Button} from "@/components/ui/button";
import {Form} from "@/components/ui/form";
import {addCategory} from "@/lib/api/category";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Loader2} from "lucide-react";
import {useToast} from "@/components/ui/use-toast";
import NumberInput from "../../../../components/form/number-input";
import ImagesInput from "@/app/manage/components/form/images-input";

const AddCategoryFormSchema = z.object({
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
        })
    }),
});

function AddCategoryForm() {
    const AddCategoryForm = useForm<z.infer<typeof AddCategoryFormSchema>>({
        resolver: zodResolver(AddCategoryFormSchema),
        defaultValues: {
            seo: {
                og_image: {image: []},
            },
        }
    });

    const router = useRouter();
    const queryClient = useQueryClient();
    const {toast} = useToast();

    const {mutate, isLoading, isError} = useMutation({
        mutationFn: addCategory,
        onSuccess: () => {
            queryClient.invalidateQueries(["CATEGORY"])
            toast({title:"Success", variant: "default"})
        },
        onError: (error) =>
            toast({
                title: "Error",
                variant: "destructive",
                description: "Category with the same slug exists",
            }),
    });

    const onSubmit = async (values: z.infer<typeof AddCategoryFormSchema>) => {
        mutate({...values});
    };

    return (
        <div>
            <Button variant="link" className="px-0" onClick={() => router.back()}>
                Back
            </Button>
            <Form {...AddCategoryForm}>
                <form
                    onSubmit={AddCategoryForm.handleSubmit(onSubmit)}
                    className="w-1/2 py-4"
                >
                    <h4>Basic Information</h4>
                    <div className="mt-4 flex flex-col gap-y-4">
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
                            <TextInput name="seo.og_title" placeholder="" label="OG Title"/>
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
                                        <NumberInput name="seo.og_image.width" label="Width"/>
                                        <NumberInput name="seo.og_image.height" label="height"/>
                                    </div>
                                    <TextInput name={"seo.og_image.alt"} label={"Alternative Text"}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="my-4">
                        <Button type="submit">
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin"/>
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default AddCategoryForm;
