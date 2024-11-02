import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

type TextInputProps = {
  name: string;
  label: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
};

function TextInput({
  name,
  label,
  placeholder,
  value,
  disabled,
}: TextInputProps) {
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
            <Input disabled={disabled} placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default TextInput;
