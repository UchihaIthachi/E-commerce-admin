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
import { useRouter } from "next/navigation"; // For navigation

// Schema matches AddBannerDTO on the server (images as single strings)
const AddBannerFormClientSchema = z.object({
  name: z.string().min(2).max(50),
  desktop_image: z.string().array().nonempty("Desktop image is required."), // Keep as array for ImagesInput
  mobile_image: z.string().array().nonempty("Mobile image is required.")   // Keep as array for ImagesInput
});

type AddBannerFormValues = z.infer<typeof AddBannerFormClientSchema>;

const AddBannerForm = () => {
  const router = useRouter();
  const form = useForm<AddBannerFormValues>({ // Renamed form instance
    resolver: zodResolver(AddBannerFormClientSchema),
    defaultValues: {
      name: "",
      desktop_image: [],
      mobile_image: [],
    },
  });

  const { toast } = useToast();
  const utils = trpc.useContext();

  const createBannerMutation = trpc.adminBanner.create.useMutation({
    onSuccess: (data) => {
      utils.adminBanner.getAll.invalidate(); // Invalidate cache for banner list
      toast({ title: "Success", description: data.message || "Banner created successfully!" });
      router.push("/manage/media/banners"); // Navigate back to the list
    },
    onError: (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "Error while adding banner",
      });
    },
  });

  const onSubmit = async (values: AddBannerFormValues) => {
    // Adapt to server DTO: take the first image from the array
    createBannerMutation.mutate({
      name: values.name,
      desktop_image: values.desktop_image[0],
      mobile_image: values.mobile_image[0],
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={"w-full md:w-1/2"} // Responsive width
      >
        <h4 className="text-lg font-semibold mb-4">Add New Banner</h4>
        <div className={"mt-4 flex flex-col gap-y-4"}>
          <TextInput name={"name"} label={"Name"} />
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
        <div className="my-6"> {/* Increased margin */}
          <Button type="submit" disabled={createBannerMutation.isLoading}>
            {createBannerMutation.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Submit
          </Button>
        </div>
      </form>
      <DevTool control={form.control} />
    </Form>
  );
};

export default AddBannerForm;
