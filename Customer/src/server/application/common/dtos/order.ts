import { z } from "zod";
import { GetCartItemDTO } from "./cart-item";
import { GetDeliveryDTO } from "./delivery";
import { GetPickupDTO } from "./pickup";

export const GetOrderDTO = z.object({
  id: z.string(),
  customer: z.string(),
  address: z.string(),
  total: z.number(),
  created: z.string(),
  order_status: z.string(),
  payment_status: z.string(),
  shipping_method: z.string(),
});

export const OrderStatusFieldDTO = z.enum(["PENDING", "FULFILLED", "REJECTED", "PROCESSING"]);
export const PaymentStatusFieldDTO = z.enum(["PENDING", "PAID"]);
export const DeliveryStatusFieldDTO = z.enum([
  "IDLE",
  "PROCESSING",
  "DISPATCHED",
  "DELIVERED",
]);

export const GetOrderSummaryDTO = z.object({
  id: z.string(),
  customer: z.string(),
  order_status: OrderStatusFieldDTO,
  payment_status: PaymentStatusFieldDTO,
  shipping_method: z.string(),
  delivery: GetDeliveryDTO.nullable(),
  pickup: GetPickupDTO.nullable(),
  delivery_status: DeliveryStatusFieldDTO.nullable(),
  payment_method: z.string().nullable(),
  orderItems: GetCartItemDTO.array(),
  total: z.number(),
  created: z.string(),
});

export const UpdateOrderDTO = z.object({
  order_status: OrderStatusFieldDTO.optional(),
  payment_status: PaymentStatusFieldDTO.optional(),
  delivery_status: DeliveryStatusFieldDTO.optional(),
});

export const OrderFilters = z
  .object({ range: z.string(), shipping_method: z.string(), payment_method: z.string(), payment_status: z.string(), delivery_status: z.string(), order_status: z.string()  })
  .partial()
  .strict();
