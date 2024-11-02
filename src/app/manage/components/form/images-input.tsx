import ImageInput from "@/app/manage/products/components/media-input/components/image-input";
import {
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {cn} from "@/lib/utils";
import {
    ControllerRenderProps,
    FieldValues,
    useFormContext,
} from "react-hook-form";
import Image from "next/image";
import ImageCard from "@/app/manage/products/components/media-input/components/image-card";
import {useMutation} from "@tanstack/react-query";
import {deleteImage, putImage} from "@/lib/api/media";
import {useToast} from "@/components/ui/use-toast";

type ImagesInputProps = {
    name: string;
    label: string;
    constrain: number;
};

function ImagesInput({name, label, constrain}: ImagesInputProps) {
    const {control} = useFormContext();
    const {toast} = useToast();

    const {mutateAsync: putImageMutate, isLoading: isPutImageMutateLoading} =
        useMutation({
            mutationFn: putImage,
            onMutate: () => {
                toast({
                    title: "Uploading...",
                });
            },
            onSuccess: () => {
                toast({
                    title: "File uploaded successfully",
                });
            },
        });

    const {
        mutateAsync: deleteImageMutate,
        isLoading: isDeleteImageMutateLoading,
    } = useMutation({
        mutationFn: deleteImage,
        onMutate: () => {
            toast({
                title: "Deleting...",
            });
        },
        onSuccess: () => {
            toast({
                title: "File Deleted successfully",
            });
        },
    });

    const handleImageChange = async (
        image: File,
        field: ControllerRenderProps<FieldValues, string>
    ) => {
        try {
            const url = await putImageMutate({file: image});
            field.onChange([...field.value, url]);
        } catch (error) {
            console.log(error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error while uploading image",
            });
        }
    };

    const handleDelete = async (
        src: string,
        field: ControllerRenderProps<FieldValues, string>
    ) => {
        try {
            console.log(src.split("/").at(-1));
            const id = src.split("/").at(-1) as string;
            await deleteImageMutate({id});
            const prevImages: string[] = field.value;
            field.onChange(prevImages.filter((el) => el !== src));
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error while deleting image",
            });
        }
    };

    return (
        <FormField
            control={control}
            name={name}
            render={({field}) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <div className="grid grid-cols-4 gap-x-4 rounded-lg w-full">
                        {field.value?.map((el: string, i: number) => (
                            <ImageCard
                                image={el}
                                key={i}
                                onDelete={(src) => handleDelete(src, field)}
                            />
                        ))}
                        <ImageInput
                            className={cn({hidden: field.value?.length == constrain})}
                            onChange={(image) => handleImageChange(image, field)}
                        />
                        <FormMessage/>
                    </div>
                </FormItem>
            )}
        />
    );
}

export default ImagesInput;
