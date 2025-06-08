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
import NumberInput from "@/app/manage/components/form/number-input";
import {addGridItem} from "@/lib/api/grid-item";

const AddGridItemFormSchema = z.object({
    index: z.number().int().positive(),
    name: z.string().min(2).max(50),
    image: z.string().array().nonempty(),
    link: z.string().nonempty()
})

const AddGridItemForm = () => {

    const AddGridItemForm = useForm<z.infer<typeof AddGridItemFormSchema>>({
            resolver: zodResolver(AddGridItemFormSchema),
            defaultValues: {
                image: []
            }
        })
    ;

    const queryClient = useQueryClient();
    const {toast} = useToast();

    const {mutate, isLoading, isError} = useMutation({
        mutationFn: addGridItem,
        onSuccess: () => {
            queryClient.invalidateQueries(["GRID_ITEM"])
            toast({title:"Success", variant: "default"})
        },
        onError: (error) =>
            toast({
                title: "Error",
                variant: "destructive",
                description: "Error while adding grid item",
            }),
    });

    const onSubmit = async (values: z.infer<typeof AddGridItemFormSchema>) => {
        mutate({index: values.index, name: values.name, image: values.image[0], link: values.link})
    }

    return (
        <Form {...AddGridItemForm}>
            <form
                onSubmit={AddGridItemForm.handleSubmit(onSubmit)}
                className={"w-1/2"}
            >
                <h4>Add new grid item</h4>
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
            <DevTool control={AddGridItemForm.control}/>
        </Form>
    );
};

export default AddGridItemForm;
