import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import TextInput from "@/app/manage/components/form/text-input";
import ImagesInput from "@/app/manage/components/form/images-input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DevTool } from "@hookform/devtools";
import { trpc } from "@/lib/providers"; // Import trpc instance
import { GetBannerDTO } from "@/server/application/common/dtos/banner"; // For prop type
import { useRouter } from "next/navigation"; // For navigation

type EditBannerFormProps = {
  banner: z.infer<typeof GetBannerDTO>; // Use GetBannerDTO for initial banner prop
};

// Client-side schema for the form, images are arrays for ImagesInput
const EditBannerFormClientSchema = z.object({
  name: z.string().min(2).max(50),
  desktop_image: z.string().array().nonempty("Desktop image is required."),
  mobile_image: z.string().array().nonempty("Mobile image is required."),
});

type EditBannerFormValues = z.infer<typeof EditBannerFormClientSchema>;

const EditBannerForm = ({ banner }: EditBannerFormProps) => {
  const router = useRouter();
  const form = useForm<EditBannerFormValues>({ // Renamed form instance
    resolver: zodResolver(EditBannerFormClientSchema),
    defaultValues: {
      name: banner.name,
      desktop_image: [banner.desktop_image], // ImagesInput expects an array
      mobile_image: [banner.mobile_image],   // ImagesInput expects an array
    },
  });

  const { toast } = useToast();
  const utils = trpc.useContext();

  const updateBannerMutation = trpc.adminBanner.update.useMutation({
    onSuccess: (data) => {
      utils.adminBanner.getAll.invalidate(); // Invalidate banner list
      utils.adminBanner.getById.invalidate({ _id: banner._id }); // Invalidate this banner's cache
      toast({ title: "Success", description: data.message || "Banner updated successfully!" });
      router.push("/manage/media/banners"); // Navigate back to the list
    },
    onError: (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "Error while updating banner",
      });
    },
  });

  const onSubmit = async (values: EditBannerFormValues) => {
    updateBannerMutation.mutate({
      _id: banner._id,
      name: values.name,
      desktop_image: values.desktop_image[0], // Server expects a single string
      mobile_image: values.mobile_image[0],   // Server expects a single string
      // Include other fields from EditBannerDTO if they exist and are managed by the form
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={"w-full md:w-1/2"} // Responsive width
      >
        {/* Changed h4 to a more descriptive title if needed, or remove if page title is sufficient */}
        {/* <h4 className="text-lg font-semibold mb-4">Edit Banner Details</h4> */}
        <div className={"mt-4 flex flex-col gap-y-4"}>
          <TextInput name={"name"} label={"Name"} />
          <ImagesInput
            constrain={1}
            name="desktop_image"
            label="Desktop Image" // Corrected label
          />
          <ImagesInput
            constrain={1}
            name="mobile_image"
            label="Mobile Image" // Corrected label
          />
        </div>
        <div className="my-6"> {/* Increased margin */}
          <Button type="submit" disabled={updateBannerMutation.isLoading}>
            {updateBannerMutation.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Update Banner
          </Button>
        </div>
      </form>
      <DevTool control={form.control} />
    </Form>
  );
};

export default EditBannerForm;
