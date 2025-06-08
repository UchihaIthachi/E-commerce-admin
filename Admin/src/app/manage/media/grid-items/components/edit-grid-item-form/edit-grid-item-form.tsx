import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import TextInput from "@/app/manage/components/form/text-input";
import ImagesInput from "@/app/manage/components/form/images-input";
import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useToast} from "@/components/ui/use-toast";
import {DevTool} from "@hookform/devtools";
import {GetGridItemDTO} from "@/server/application/common/dtos/grid-item";
import NumberInput from "@/app/manage/components/form/number-input";
import {updateGridItem} from "@/lib/api/grid-item";

type EditGridItemFormProps = {
    grid_item: z.infer<typeof GetGridItemDTO>;
}

const EditGridItemFormSchema = z.object({
    index: z.number().int().positive(),
    name: z.string().min(2).max(50),
    image: z.string().array().nonempty(),
    link: z.string().nonempty()
})

const EditGridItemForm = ({grid_item}: EditGridItemFormProps) => {

    const EditGridItemForm = useForm<z.infer<typeof EditGridItemFormSchema>>({
            resolver: zodResolver(EditGridItemFormSchema),
            defaultValues: {
                index: grid_item.index,
                name: grid_item.name,
                image: [grid_item.image],
                link: grid_item.link
            }
        })
    ;

    const queryClient = useQueryClient();
    const {toast} = useToast();

    const {mutate, isLoading, isError} = useMutation({
        mutationFn: updateGridItem,
        onSuccess: () => {
            queryClient.invalidateQueries(["GRID_ITEM"])
            toast({title:"Success", variant: "default"})
        },
        onError: (error) =>
            toast({
                title: "Error",
                variant: "destructive",
                description: "Error while updating grid item",
            }),
    });

    const onSubmit = async (values: z.infer<typeof EditGridItemFormSchema>) => {
        mutate({_id: grid_item._id, index: values.index, name: values.name, image: values.image[0], link: values.link})
    }

    return (
        <Form {...EditGridItemForm}>
            <form
                onSubmit={EditGridItemForm.handleSubmit(onSubmit)}
                className={"w-1/2"}
            >
                <h4>Add new banner</h4>
                <div className={"mt-4 flex flex-col gap-y-4"}>
                    <NumberInput name={"index"} label={"Index"}/>
                    <TextInput name={"name"} label={"Name"}/>
                    <ImagesInput
                        constrain={1}
                        name="image"
                        label="Image"
                    />
                    <TextInput name={"link"} label={"Link"}/>
                </div>
                <div className="my-4">
                    <Button type="submit">
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin"/>
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </div>
            </form>
            <DevTool control={EditGridItemForm.control}/>
        </Form>
    );
};

export default EditGridItemForm;
