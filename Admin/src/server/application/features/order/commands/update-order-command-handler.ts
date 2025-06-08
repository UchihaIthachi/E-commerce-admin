import {
  DeliveryStatusFieldDTO,
  OrderStatusFieldDTO,
  PaymentStatusFieldDTO,
} from "@/server/application/common/dtos/order";
import {
  updateDeliveryStatus,
  updateOrderStatus,
  updatePaymentStatus,
} from "@/server/infrastructure/repositories/order/order-repository";
import { z } from "zod";

type UpdatOrderCommand = {
  id: string;
  order_status?: z.infer<typeof OrderStatusFieldDTO>;
  payment_status?: z.infer<typeof PaymentStatusFieldDTO>;
  delivery_status?: z.infer<typeof DeliveryStatusFieldDTO>;
};

export default async function updateOrderCommandHandler(
  command: UpdatOrderCommand
) {
  const { id, order_status, payment_status, delivery_status } = command;
  if (order_status) {
    await updateOrderStatus({ id, order_status });
    return;
  }
  if (payment_status) {
    await updatePaymentStatus({ id, payment_status });
    return;
  }
  if (delivery_status) {
    await updateDeliveryStatus({ id, delivery_status });
    return;
  }
}
