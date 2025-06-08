"use client";

import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { getOrders } from "@/lib/api/order";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FilterForm from "@/app/manage/orders/components/filter-form/filter-form";
import { useSearchParams } from "next/navigation";
import LoadingSpinner from '@/components/ui/LoadingSpinner'; // Import LoadingSpinner
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
      <h2 className="pt-6 px-6">Orders</h2>
      <div className={"p-4 grid grid-cols-1 gap-y-4"}>
        <div className={"p-4 grid grid-cols-1 md:grid-cols-2 gap-4"}> {/* Adjusted grid layout for responsiveness and consistent gap */}
          <Card> {/* Removed pt-4 px-4 */}
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <FilterForm />
            </CardContent>
          </Card>
          { isLoading? (
            <div className='pt-4 px-4 text-center col-span-1 md:col-span-1 flex justify-center items-center h-full'> {/* Added flex centering and h-full */}
              <LoadingSpinner size="h-10 w-10" />
            </div>
            ) :
          (
            <Card> {/* Removed pt-4 px-4 and flex layout classes */}
              <CardHeader>
                <CardTitle>Sales</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center h-full"> {/* Applied flex layout here, added h-full for better centering if card height is constrained */}
                <h1 className="text-3xl font-bold text-center"> {/* Ensured sales figure is prominent */}
                  {(totalSales) ? `${totalSales.toLocaleString()} LKR` : "No sales for given filters"}
                </h1>
              </CardContent>
            </Card>
          )
          }
        </div>
        <div className="overflow-x-scroll ">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <LoadingSpinner size="h-12 w-12" />
            </div>
          ) : (
            <DataTable columns={columns} data={data!} />

          )}
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;
