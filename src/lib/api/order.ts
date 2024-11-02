import api from "./base";
import {
  DeliveryStatusFieldDTO,
  GetOrderDTO,
  GetOrderSummaryDTO,
  OrderStatusFieldDTO,
  PaymentStatusFieldDTO,
} from "@/server/application/common/dtos/order";
import { z } from "zod";

export const getOrders = async (filters: string) => {
  const res = await api.get(`/api/orders?${filters}`);
  const orders = GetOrderDTO.array().parse(await res.json());
  return orders;
};

export const getOrder = async (id: string) => {
  const res = await api.get(`/api/orders/${id}`);
  const order = GetOrderSummaryDTO.parse(await res.json());
  const createdDateTime = new Date(order.created);
  return {
    ...order,
    created: `${createdDateTime.toLocaleDateString()} ${createdDateTime.toLocaleTimeString()}`,
  };
};

export const updateOrderStatus = async ({
  id,
  order_status,
}: {
  id: string;
  order_status: z.infer<typeof OrderStatusFieldDTO>;
}) => {
  const res = await api.patch(`/api/orders/${id}`, {
    json: { order_status },
  });
};

export const updatePaymentStatus = async ({
  id,
  payment_status,
}: {
  id: string;
  payment_status: z.infer<typeof PaymentStatusFieldDTO>;
}) => {
  const res = await api.patch(`/api/orders/${id}`, {
    json: { payment_status },
  });
};

export const updateDeliveryStatus = async ({
  id,
  delivery_status,
}: {
  id: string;
  delivery_status: z.infer<typeof DeliveryStatusFieldDTO>;
}) => {
  const res = await api.patch(`/api/orders/${id}`, {
    json: { delivery_status },
  });
};
