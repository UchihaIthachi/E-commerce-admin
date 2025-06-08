"use client";

import TextInput from "@/app/manage/components/form/text-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { updateSize} from "@/lib/api/size";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { GetSizeDTO } from "@/server/application/common/dtos/size";

const EditSizeFormSchema = z.object({
    name: z.string().min(2).max(50).refine((v) => v === v.toUpperCase(), {
        message: "Size Names can't have simple letters",
    }),
});

function EditSizeForm({
    size,
}: {
    size: z.infer<typeof GetSizeDTO>;
}) {
    const EditSizeForm = useForm<z.infer<typeof EditSizeFormSchema>>({
        resolver: zodResolver(EditSizeFormSchema),
        defaultValues: {
            name: size.name,
        },
    });

    const router = useRouter();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { mutate, isLoading } = useMutation({
        mutationFn: updateSize,
        onSuccess: () => {
            queryClient.invalidateQueries(["SIZES"])
            toast({title:"Success", variant: "default"})
        },
        onError: (error) =>
            toast({
                title: "Error",
                variant: "destructive",
                description: "Cannot update as size is already referenced",
            }),
    });

    const onSubmit = async (values: z.infer<typeof EditSizeFormSchema>) => {
        mutate({ _id: size._id, ...values });
    };

    return (
        <div>
            <Button variant="link" className="px-0" onClick={() => router.back()}>
                Back
            </Button>
            <Form {...EditSizeForm}>
                <form
                    onSubmit={EditSizeForm.handleSubmit(onSubmit)}
                    className="w-1/2 py-4"
                >
                    <h4>Basic Information</h4>
                    <div className="mt-4 flex flex-col gap-y-4">
                        <TextInput name="name" placeholder="UK 10" label="Name" />
                    </div>
                    <div className="my-4">
                        <Button type="submit">
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
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

export default EditSizeForm;
