"use client";

import DateRangeInput from "@/app/manage/components/form/date-range-input";
import SelectInput from "../../[id]/components/select-input";
import { SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FilterFormSchema = z.object({
  range: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
  shipping_method: z.enum(["DELIVERY", "PICKUP"]).optional(),
  payment_method: z.enum(["CREDIT_CARD", "COD"]).optional(),
  payment_status: z.enum(["PENDING", "PAID"]).optional(),
  delivery_status: z
    .enum(["IDLE", "PROCESSING", "DISPATCHED", "DELIVERED"])
    .optional(),
  order_status: z.enum(["PENDING", "FULFILLED", "REJECTED"]).optional(),
});
const FilterForm = () => {
  const FilterForm = useForm<z.infer<typeof FilterFormSchema>>({
    resolver: zodResolver(FilterFormSchema),
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // const createQueryString = useCallback(
  //   // (name: string, value: string) => {
  //   //   const params = new URLSearchParams(searchParams);
  //   //   params.set(name, value);

  //   //   return params.toString();
  //   // },
  //   // [searchParams]
  //   return
  // );

  const createQueryString = (name: string, value: string) => {
    return `${name}=${value}`;
  };

  const buildQuery = (values: any) => {
    // console.log(values)
    let count = 0;
    let query = `${pathname}?`;
    console.log(query);
    console.log(values);

    for (let key in values) {
      if (values[key] != undefined) {
        if (count != 0) {
          if (key === "range") {
            query = `${query}&${createQueryString(
              "range",
              `${values.range.from?.toISOString()}_${values.range.to?.toISOString()}`
            )}`;
            count += 1;
          } else {
            query = `${query}&${createQueryString(key, values[key])}`;
            count += 1;
          }
        } else {
          if (key === "range") {
            query = `${query}${createQueryString(
              "range",
              `${values.range.from?.toISOString()}_${values.range.to?.toISOString()}`
            )}`;
            count += 1;
          } else {
            query = `${query}${createQueryString(key, values[key])}`;
            count += 1;
          }
        }
      }
    }
    console.log(query);
    return query;
  };

  const onSubmit = async (values: z.infer<typeof FilterFormSchema>) => {
    router.push(buildQuery(values));
  };

  const onClear = () => {
    router.push(`${pathname}`);
  };

  const shipping_methods = ["DELIVERY", "PICKUP"];
  const payment_methods = ["CREDIT_CARD", "COD"];
  const payment_status = ["PENDING", "PAID"];
  const delivery_status = ["IDLE", "PROCESSING", "DISPATCHED", "DELIVERED"];
  const order_status = ["PENDING", "FULFILLED", "REJECTED"];

  return (
    <Form {...FilterForm}>
      <form onSubmit={FilterForm.handleSubmit(onSubmit)} className="py-4">
        <DateRangeInput name={"range"} label={"Date Range"} />
        <div>
          <div className="w-1/2 ">
            <SelectInput
              name={"shipping_method"}
              label={"Shipping Method"}
              placeholder={""}
            >
              {shipping_methods.map((el, i) => (
                <SelectItem key={i} value={el}>
                  {el}
                </SelectItem>
              ))}
            </SelectInput>
          </div>
          <div className="w-1/2 ">
            <SelectInput
              name={"payment_method"}
              label={"Payment Method"}
              placeholder={""}
            >
              {payment_methods.map((el, i) => (
                <SelectItem key={i} value={el}>
                  {el}
                </SelectItem>
              ))}
            </SelectInput>
          </div>
          <div className="w-1/2 ">
            <SelectInput
              name={"payment_status"}
              label={"Payment Status"}
              placeholder={""}
            >
              {payment_status.map((el, i) => (
                <SelectItem key={i} value={el}>
                  {el}
                </SelectItem>
              ))}
            </SelectInput>
          </div>
          <div className="w-1/2 ">
            <SelectInput
              name={"delivery_status"}
              label={"Delivery Status"}
              placeholder={""}
            >
              {delivery_status.map((el, i) => (
                <SelectItem key={i} value={el}>
                  {el}
                </SelectItem>
              ))}
            </SelectInput>
          </div>
          <div className="w-1/2 ">
            <SelectInput
              name={"order_status"}
              label={"Order Status"}
              placeholder={""}
            >
              {order_status.map((el, i) => (
                <SelectItem key={i} value={el}>
                  {el}
                </SelectItem>
              ))}
            </SelectInput>
          </div>
        </div>
        <div className="my-4 flex gap-x-4">
          <Button type="submit">Filter</Button>
          <Button type="button" onClick={onClear} variant={"secondary"}>
            Clear Filters
          </Button>
        </div>
      </form>
      {/* <DevTool control={FilterForm.control} /> */}
    </Form>
  );
};

export default FilterForm;
