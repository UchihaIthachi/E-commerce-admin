import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PlusCircleIcon, TrashIcon } from "lucide-react";

import { SelectItem } from "@/components/ui/select";

import { useFieldArray, useFormContext } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { getColors, getSizes } from "@/lib/api/cloth";
import { useQuery } from "@tanstack/react-query";
import SelectInput from "@/app/manage/components/form/select-input";
import NumberInput from "@/app/manage/components/form/number-input";

type VariantsInputProps = {
  name: string;
  label: string;
};

function VariantsInput({ name, label }: VariantsInputProps) {
  const { toast } = useToast();
  const { control, formState } = useFormContext();

  const { data: colors, isLoading: isColorsLoading } = useQuery({
    queryKey: ["COLOR"],
    queryFn: getColors,
  });

  const { data: sizes, isLoading: isSizesLoading } = useQuery({
    queryKey: ["SIZE"],
    queryFn: getSizes,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{""}</FormLabel>
          <div className="gap-y-4 grid">
            {fields.map((el, i) => (
              <div key={el.id} className="flex w-full gap-x-4">
                <div key={el.id} className="grid grid-cols-3 gap-x-4">
                  <SelectInput
                    disabled={isColorsLoading}
                    name={`variants[${i}].color`}
                    placeholder="Select a color"
                    label="Color"
                  >
                    {colors?.map((el) => (
                      <SelectItem key={el._id} value={el._id}>
                        {el.name}
                      </SelectItem>
                    ))}
                  </SelectInput>
                  <SelectInput
                    disabled={isSizesLoading}
                    name={`variants[${i}].size`}
                    label="Size"
                    placeholder="Select a size"
                  >
                    {sizes?.map((el) => (
                      <SelectItem key={el._id} value={el._id}>
                        {el.name}
                      </SelectItem>
                    ))}
                  </SelectInput>
                  <NumberInput name={`variants[${i}].stock`} label="Stock" />
                </div>
                <Button
                  type="button"
                  variant={"destructive"}
                  onClick={() => remove(i)}
                  className="px-3 py-1 relative top-8"
                >
                  <TrashIcon width={24} height={24} className="block w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant={"outline"}
              onClick={() => append({ stock: 0 })}
              className="flex justify-center items-center h-12 w-80"
            >
              <PlusCircleIcon width={24} height={24} className="block" />
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default VariantsInput;
