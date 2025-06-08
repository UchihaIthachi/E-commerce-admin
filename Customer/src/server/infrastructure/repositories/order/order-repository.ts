import { z } from "zod";
import prisma from "../../clients/prisma";
import {
  DeliveryStatusFieldDTO,
  OrderStatusFieldDTO,
  PaymentStatusFieldDTO,
} from "@/server/application/common/dtos/order";
import { OrderFilters } from "@/server/application/common/dtos/order";

// type GetOrdersParams = z.infer<typeof OrderFilters>;

export const getOrders = async (filters: any) => {
  const orders = await prisma.order.findMany({
    where: filters,
    include: {
      orderItems: true,
      delivery: {
        include: {
          address: true,
        },
      },
      pickup: {
        include: {
          address: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const mappedOrders = orders.map((el) => {
    const subtotal = el.orderItems
      .map((o) => o.count * o.price)
      .reduce((acc, i) => acc + i, 0);
    const shipping = el.delivery?.cost ?? 0;
    const discount = el.orderItems
      .map((o) => (o.count * o.price * o.discount) / 100)
      .reduce((acc, i) => acc + i, 0);
    const total = subtotal + shipping - discount;

    if (el.shipping_method === "DELIVERY") {
      return {
        ...el,
        customer: `${el.delivery?.address.fname} ${el.delivery?.address.lname}`,
        address: `${el.delivery?.address.line_1} ${el.delivery?.address.line_2} ${el.delivery?.address.city}`,
        total,
        created: el.createdAt.toISOString(),
      };
    }

    if (el.shipping_method === "PICKUP") {
      return {
        ...el,
        customer: `${el.pickup?.address?.fname} ${el.pickup?.address?.lname}`,
        address: "-",
        total,
        created: el.createdAt.toISOString(),
      };
    }
  });
  return mappedOrders;
};

export const getOrderSummary = async (id: string) => {
  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      orderItems: true,
      delivery: {
        include: {
          address: true,
        },
      },
      pickup: {
        include: {
          address: true,
        },
      },
    },
  });

  const subtotal = order!.orderItems
    .map((o) => o.count * o.price)
    .reduce((acc, i) => acc + i, 0);
  const shipping = order!.delivery?.cost ?? 0;
  const discount = order!.orderItems
    .map((o) => (o.count * o.price * o.discount) / 100)
    .reduce((acc, i) => acc + i, 0);
  const total = subtotal + shipping - discount;

  if (order?.shipping_method === "DELIVERY") {
    return {
      ...order,
      id: order?.id,
      customer: `${order?.delivery?.address.fname} ${order?.delivery?.address.lname}`,
      total,
      created: order?.createdAt.toISOString(),
      order_status: order?.order_status,
      payment_status: order?.payment_status,
    };
  }

  if (order?.shipping_method === "PICKUP") {
    return {
      ...order,
      id: order?.id,
      customer: `${order?.pickup?.address?.fname} ${order?.pickup?.address?.lname}`,
      address: "-",
      total,
      created: order?.createdAt.toISOString(),
      order_status: order?.order_status,
      payment_status: order?.payment_status,
    };
  }
};

type UpdateOrderStatusParams = {
  id: string;
  order_status: z.infer<typeof OrderStatusFieldDTO>;
};

export const updateOrderStatus = async ({
  id,
  order_status,
}: UpdateOrderStatusParams) => {
  await prisma.order.update({
    where: {
      id,
    },
    data: {
      order_status,
    },
  });
};

type UpdatePaymentStatusParams = {
  id: string;
  payment_status: z.infer<typeof PaymentStatusFieldDTO>;
};

export const updatePaymentStatus = async ({
  id,
  payment_status,
}: UpdatePaymentStatusParams) => {
  await prisma.order.update({
    where: {
      id,
    },
    data: {
      payment_status,
    },
  });
};

type UpdateDeliveryStatusParams = {
  id: string;
  delivery_status: z.infer<typeof DeliveryStatusFieldDTO>;
};

export const updateDeliveryStatus = async ({
  id,
  delivery_status,
}: UpdateDeliveryStatusParams) => {
  await prisma.order.update({
    where: {
      id,
    },
    data: {
      delivery_status,
    },
  });
};
