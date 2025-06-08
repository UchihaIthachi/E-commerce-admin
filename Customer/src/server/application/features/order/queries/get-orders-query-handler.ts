import { OrderFilters } from "@/server/application/common/dtos/order";
import { getOrders } from "@/server/infrastructure/repositories/order/order-repository";
import { z } from "zod";

type GetOrdersQuery = z.infer<typeof OrderFilters>;

export default async function getOrdersQueryHandler(filters: GetOrdersQuery) {
  const { range, ...filtersWithCreatedAt } = filters;
  if (!range) {
    const orders = await getOrders(filters);
    return orders;
  }
  const from = range?.split("_")[0] as string;
  const to = range?.split("_")[1] as string;
  
  const orders = await getOrders({
    ...filtersWithCreatedAt, createdAt : {
      gt: new Date(from),
      lt: new Date(to)
    }
  });
  return orders;
}
