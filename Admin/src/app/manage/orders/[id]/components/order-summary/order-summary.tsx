import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GetOrderSummaryDTO } from "@/server/application/common/dtos/order";
import { z } from "zod";
import { OrderItemsTable } from "./components/order-items-table/order-items-table";
import { columns } from "./components/order-items-table/columns";
import UpdateOrderStatusForm from "./components/update-order-status-form/update-order-status-form";
import UpdatePaymentStatusForm from "./components/update-payment-status-form/update-payment-status-form";
import UpdateDeliveryStatusForm from "./components/update-delivery-status-form/update-delivery-status-form";

function OrderSummary({
  order,
}: {
  order: z.infer<typeof GetOrderSummaryDTO>;
}) {
  return (
    <div>
      <div>
        <h3>Basic Information</h3>
        <div className="flex flex-col mt-4 justify-stretch gap-y-8">
          <div className="flex flex-col justify-stretch gap-y-2">
            <Label>ID</Label>
            <span className="text-2xl block">{order.id}</span>
          </div>
          <div className="flex flex-col justify-stretch gap-y-2">
            <Label>Customer</Label>
            <span className="text-2xl block">{order.customer}</span>
          </div>
          <div className="flex flex-col justify-stretch gap-y-2">
            <Label>Placed Date & Time</Label>
            <span className="text-2xl block">{order.created}</span>
          </div>
          <div className="flex flex-col justify-stretch gap-y-2">
            <Label>Order Total</Label>
            <span className="text-2xl block">LKR {order.total}</span>
          </div>
          <div className="w-1/4">
            <UpdateOrderStatusForm order_status={order.order_status} />
          </div>
        </div>
      </div>
      <Separator className="my-2" />
      <div className="mt-8">
        <h3>Shipping</h3>
        <div className="flex flex-col mt-4 justify-stretch gap-y-4">
          <div className="flex flex-col justify-stretch gap-y-2">
            <Label>Shipping Method</Label>
            <small className="text-2xl block">{order.shipping_method}</small>
          </div>
          {order.shipping_method === "DELIVERY" && (
            <div className="flex flex-col justify-stretch gap-y-4">
              <div className="flex flex-col justify-stretch gap-y-2">
                <Label>Address</Label>
                <div>
                  <p className="text-2xl block">
                    {order.delivery?.address.fname}{" "}
                    {order.delivery?.address.lname}
                    <br />
                    {order.delivery?.address.line_1}
                    <br />
                    {order.delivery?.address.line_2}
                    <br />
                    {order.delivery?.address.city}
                    <br />
                    {order.delivery?.address.country}
                    <br />
                  </p>
                </div>
                <Label>Contact Information</Label>
                <div>
                  <p className="text-2xl block">
                    {order.delivery?.email}
                    <br />
                    {order.delivery?.phone}
                    <br />
                  </p>
                </div>
              </div>
              <UpdateDeliveryStatusForm
                delivery_status={order.delivery_status!}
              />
            </div>
          )}
          <div>
            {order.shipping_method === "PICKUP" && (
              <div className="flex flex-col justify-stretch gap-y-2">
                <Label>Contact Information</Label>
                <div>
                  <p className="text-2xl block">
                    {order.pickup?.address?.fname}
                    <br />
                    {order.pickup?.address?.lname}
                    <br />
                    {order.pickup?.email}
                    <br />
                    {order.pickup?.phone}
                    <br />
                  </p>
                </div>
                <Label>Store</Label>
                <div>
                  <p className="text-2xl block">
                    {order.pickup?.store}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Separator className="my-2" />
      <div className="mt-8">
        <h3>Payment</h3>
        <div className="flex flex-col mt-4 justify-stretch gap-y-8">
          <div className="flex flex-col justify-stretch gap-y-2">
            <Label>Payment Method</Label>
            <span className="text-2xl block">
              {order.payment_method ?? "-"}
            </span>
          </div>
          <UpdatePaymentStatusForm payment_status={order.payment_status} />
        </div>
      </div>
      <Separator className="my-2" />
      <div className="mt-8">
        <h3>Order Content</h3>
        <div className="py-4">
          <OrderItemsTable columns={columns} data={order.orderItems} />
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;
