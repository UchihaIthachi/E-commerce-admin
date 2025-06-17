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
// import {useMutation} from "@tanstack/react-query"; // Replaced by tRPC hooks
// import {deleteImage, putImage} from "@/lib/api/media"; // Replaced by tRPC calls
import { trpc } from "@/lib/providers"; // Import trpc instance
import {useToast} from "@/components/ui/use-toast";

type ImagesInputProps = {
    name: string;
    label: string;
    constrain: number;
};

function ImagesInput({name, label, constrain}: ImagesInputProps) {
    const {control} = useFormContext();
    const {toast} = useToast();
    const utils = trpc.useContext(); // For potential cache invalidations if needed

    const createPresignedUrlMutation = trpc.adminImage.createPresignedUploadUrl.useMutation({
        onSuccess: (data) => {
            // toast({ title: "Presigned URL created", description: "Ready to upload." });
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Error creating upload URL",
                description: error.message,
            });
        }
    });

    const deleteImageMutation = trpc.adminImage.deleteImage.useMutation({
        onSuccess: (data) => {
            toast({ title: "Success", description: data.message });
            // Potentially invalidate queries if there's a list of images somewhere
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Error deleting image",
                description: error.message,
            });
        }
    });


    const handleImageChange = async (
        imageFile: File, // Renamed to imageFile for clarity
        field: ControllerRenderProps<FieldValues, string>
    ) => {
        if (!imageFile) return;

        toast({ title: "Processing image..." });

        try {
            // 1. Get presigned URL from tRPC
            const presignedData = await createPresignedUrlMutation.mutateAsync({
                fileType: imageFile.type,
            });

            // 2. Upload file to presigned URL (Cloudflare R2 / S3)
            const uploadResponse = await fetch(presignedData.url, {
                method: 'PUT',
                body: imageFile,
                headers: {
                    'Content-Type': imageFile.type,
                },
            });

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                throw new Error(`Upload failed: ${uploadResponse.statusText} - ${errorText}`);
            }

            toast({ title: "File uploaded successfully" });

            // 3. Update form state with the public URL
            const currentImages = field.value || [];
            field.onChange([...currentImages, presignedData.publicURL]);

        } catch (error: any) {
            console.error("Error during image upload process:", error);
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
