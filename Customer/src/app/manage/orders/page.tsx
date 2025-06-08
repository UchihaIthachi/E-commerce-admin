"use client";

import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { getOrders } from "@/lib/api/order";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import FilterForm from "@/app/manage/orders/components/filter-form/filter-form";
import { useSearchParams } from "next/navigation";
import { getRange } from "@/app/manage/orders/components/utils/utils";

function OrdersPage() {
  const filters = useSearchParams().toString();

  const { data, isLoading } = useQuery({
    queryKey: ["ORDER", filters],
    queryFn: () => getOrders(filters),
  });

  // console.log(filters);
  console.log(data);
  const paidOrders = data?.filter((order) => order.payment_status == "PAID")
  const totalSales = paidOrders?.map((order) => order.total)
    .reduce((acc, i) => acc + i, 0);
  console.log(totalSales);

  return (
    <div>
      <h2 className="p-2">Orders</h2>
      <div className={"p-4 grid grid-cols-1 gap-y-4"}>
        <div className={"p-4 grid grid-cols-2 gap-y-4"}>
          <Card className={"pt-4 px-4"}>
            <h4>Filters</h4>
            <FilterForm />
          </Card>
          { isLoading? (<div className='pt-4 px-4 text-center'>Loading...</div>) : 
          (
            <Card className="pt-4 px-4 flex flex-col justify-center items-center">
              <h4>Sales</h4>
              <h1 className="text-center">{(totalSales) ? `${totalSales} LKR` : "No sales for given filters"}</h1>
            </Card>
          )
          }
        </div>
        <div className="overflow-x-scroll ">
          {isLoading ? (
            "Loading..."
          ) : (
            <DataTable columns={columns} data={data!} />

          )}
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;
