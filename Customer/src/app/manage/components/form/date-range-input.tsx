import React from 'react';
import {useFormContext} from "react-hook-form";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Switch} from "@/components/ui/switch";
import {DatePickerWithRange} from "@/components/ui/date-range-picker";

type DateRangeInputProps = {
    name: string;
    label: string;
};
const DateRangeInput = ({name, label}: DateRangeInputProps) => {
    const {control} = useFormContext();
    return (
        <FormField
            control={control}
            name={name}
            render={({field}) => (
                <FormItem className="grid grid-cols-1 gap-y-2">
                    <FormLabel className="text-base">{label}</FormLabel>
                    <DatePickerWithRange value={field.value}
                                         onValueChange={field.onChange}/>
                    <FormMessage/>
                </FormItem>
            )}
        />
    );
};

export default DateRangeInput;
