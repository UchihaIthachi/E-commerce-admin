"use client";

// import { getOrder } from "@/lib/api/order"; // No longer needed
import OrderSummary from "./components/order-summary/order-summary";
// import { useQuery } from "@tanstack/react-query"; // No longer needed
import { trpc } from "@/lib/providers"; // Import trpc instance
import { Loader2 } from "lucide-react"; // For loading state

function OrderPage({ params: { id } }: { params: { id: string } }) {
  const {
    data: order, // Renamed data to order for clarity
    isLoading,
    error, // Add error handling
  } = trpc.adminOrder.getById.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading order data...</p>
      </div>
    );
  }

  if (error || !order) {
    return <p>Error loading order or order not found.</p>;
  }

  return (
    <div>
      <h2 className="p-2">Order Details</h2> {/* More specific title */}
      <div className="p-4">
        <OrderSummary order={order} /> {/* Pass loaded order data */}
      </div>
    </div>
  );
}

export default OrderPage;
