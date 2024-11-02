"use client";

import { getOrder } from "@/lib/api/order";
import OrderSummary from "./components/order-summary/order-summary";
import { useQuery } from "@tanstack/react-query";

function OrderPage({ params: { id } }: { params: { id: string } }) {
  const { data, isLoading } = useQuery({
    queryKey: ["ORDER", id],
    queryFn: () => getOrder(id),
  });

  return (
    <div>
      <h2 className="p-2">Orders</h2>
      <div className="p-4">
        {isLoading ? "Loading..." : <OrderSummary order={data!} />}
      </div>
    </div>
  );
}

export default OrderPage;
