import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon, Trash2Icon } from "lucide-react";
import { SelectItem } from "@/components/ui/select";
import { getColors } from "@/lib/api/cloth";
import { useQuery } from "@tanstack/react-query";

import SelectInput from "@/app/manage/components/form/select-input";
import ImagesInput from "@/app/manage/components/form/images-input";
import SwitchInput from "@/app/manage/components/form/checkbox-input";

type MediaInputProps = {
  name: string;
  label: string;
};

function MediaInput({ name, label }: MediaInputProps) {
  const { control, watch } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "media",
  });

  const { data: colors, isLoading: isColorsLoading } = useQuery({
    queryKey: ["COLOR"],
    queryFn: getColors,
  });

  const c: string[] = watch("variants").map((o: any) => o.color);
  const selectedColors = colors?.filter((o) => c.includes(o._id));

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{""}</FormLabel>
          <div className="gap-y-4 grid">
            {fields.map((el, i) => (
              <div key={i} className="p-4 border rounded-md relative">
                <div className="grid grid-cols-1 gap-y-4">
                  <div className="w-1/2">
                    <SelectInput
                      disabled={isColorsLoading}
                      name={`media[${i}].color`}
                      label="Color"
                      placeholder="Select a color"
                    >
                      {colors?.map((el) => (
                        <SelectItem key={el._id} value={el._id}>
                          {el.name}
                        </SelectItem>
                      ))}
                    </SelectInput>
                  </div>
                  <ImagesInput
                    constrain={4}
                    name={`media[${i}].images`}
                    label="Images"
                  />
                  <SwitchInput name={`media[${i}].isDefault`} label="Default" />
                </div>
                <Trash2Icon
                  width={24}
                  height={24}
                  onClick={() => remove(i)}
                  className="absolute right-4 top-4 p-1 border cursor-pointer border-red-500 rounded-md text-red-500"
                />
              </div>
            ))}
            <Button
              type="button"
              variant={"outline"}
              onClick={() => append({ images: [], isDefault: false })}
              className="flex justify-center items-center h-12 w-80 "
            >
              <PlusCircleIcon width={24} height={24} className="block" />
            </Button>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

export default MediaInput;
