import {FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Textarea} from "@/components/ui/textarea"
import {useFormContext} from "react-hook-form";

type TextAreaInputProps = {
  name: string;
  label: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
};

function TextAreaInput({
  name,
  label,
  placeholder,
  value,
  disabled,
}: TextAreaInputProps) {
  const { control } = useFormContext();

  return (
    <FormField
      defaultValue={value}
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea disabled={disabled} placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default TextAreaInput;
