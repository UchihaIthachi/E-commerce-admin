import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import TextInput from "@/app/manage/components/form/text-input";
import ImagesInput from "@/app/manage/components/form/images-input";
import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {addCategory} from "@/lib/api/category";
import {useToast} from "@/components/ui/use-toast";
import {DevTool} from "@hookform/devtools";
import {addBanner} from "@/lib/api/banner";

const AddBannerFormSchema = z.object({
    name: z.string().min(2).max(50),
    desktop_image: z.string().array().nonempty(),
    mobile_image:z.string().array().nonempty()
})

const AddBannerForm = () => {

    const AddBannerForm = useForm<z.infer<typeof AddBannerFormSchema>>({
        resolver: zodResolver(AddBannerFormSchema),
        defaultValues: {
            desktop_image: [],
            mobile_image: []
        }
    });

    const queryClient = useQueryClient();
    const {toast} = useToast();

    const {mutate, isLoading, isError} = useMutation({
        mutationFn: addBanner,
        onSuccess: () => {
            queryClient.invalidateQueries(["BANNER"])
            toast({title:"Success", variant: "default"})
        },
        onError: (error) =>
            toast({
                title: "Error",
                variant: "destructive",
                description: "Error while adding banner",
            }),
    });

    const onSubmit = async (values: z.infer<typeof AddBannerFormSchema>) => {
        mutate({name: values.name, desktop_image: values.desktop_image[0], mobile_image: values.mobile_image[0]})
    }

    return (
        <Form {...AddBannerForm}>
            <form
                onSubmit={AddBannerForm.handleSubmit(onSubmit)}
                className={"w-1/2"}
            >
                <h4>Add new banner</h4>
                <div className={"mt-4 flex flex-col gap-y-4"}>
                    <TextInput name={"name"} label={"Name"}/>
                    <ImagesInput
                        constrain={1}
                        name="desktop_image"
                        label="Desktop Image"
                    />
                    <ImagesInput
                        constrain={1}
                        name="mobile_image"
                        label="Mobile Image"
                    />
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
            <DevTool control={AddBannerForm.control}/>
        </Form>
    );
};

export default AddBannerForm;
