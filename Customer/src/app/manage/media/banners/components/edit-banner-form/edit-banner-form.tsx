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
import {updateBanner} from "@/lib/api/banner";
import {GetBannerDTO} from "@/server/application/common/dtos/banner";

type EditBannerFormProps = {
    banner: z.infer<typeof GetBannerDTO>;
}

const EditBannerFormSchema = z.object({
    name: z.string().min(2).max(50),
    desktop_image: z.string().array().nonempty(),
    mobile_image: z.string().array().nonempty()
})

const EditBannerForm = ({banner}: EditBannerFormProps) => {

    const EditBannerForm = useForm<z.infer<typeof EditBannerFormSchema>>({
        resolver: zodResolver(EditBannerFormSchema),
        defaultValues: {
            name: banner.name,
            desktop_image: [banner.desktop_image],
            mobile_image: [banner.mobile_image]
        }
    });

    const queryClient = useQueryClient();
    const {toast} = useToast();

    const {mutate, isLoading, isError} = useMutation({
        mutationFn: updateBanner,
        onSuccess: () => {
            queryClient.invalidateQueries(["BANNER"])
            toast({title:"Success", variant: "default"})
        },
        onError: (error) =>
            toast({
                title: "Error",
                variant: "destructive",
                description: "Error while updating banner",
            }),
    });

    const onSubmit = async (values: z.infer<typeof EditBannerFormSchema>) => {
        mutate({
            _id: banner._id,
            name: values.name,
            desktop_image: values.desktop_image[0],
            mobile_image: values.mobile_image[0]
        })
    }

    return (
        <Form {...EditBannerForm}>
            <form
                onSubmit={EditBannerForm.handleSubmit(onSubmit)}
                className={"w-1/2"}
            >
                <h4>Add new banner</h4>
                <div className={"mt-4 flex flex-col gap-y-4"}>
                    <TextInput name={"name"} label={"Name"}/>
                    <ImagesInput
                        constrain={1}
                        name="desktop_image"
                        label="Image"
                    />
                    <ImagesInput
                        constrain={1}
                        name="mobile_image"
                        label="Image"
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
            <DevTool control={EditBannerForm.control}/>
        </Form>
    );
};

export default EditBannerForm;
