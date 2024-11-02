import {FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {useFormContext} from "react-hook-form";

import {Select, SelectContent, SelectTrigger, SelectValue,} from "@/components/ui/select";

type SelectInputProps = {
  name: string;
  label: string;
  placeholder: string;
  children: React.ReactNode;
  disabled?: boolean;
};

function SelectInput({
  name,
  label,
  placeholder,
  children,
  disabled,
}: SelectInputProps) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            disabled={disabled}
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>{children}</SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default SelectInput;
