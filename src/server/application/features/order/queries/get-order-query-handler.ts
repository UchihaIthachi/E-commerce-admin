import { getOrderSummary } from "@/server/infrastructure/repositories/order/order-repository";

type GetOrdersQuery = {
  id: string;
};

export default async function getOrderQueryHandler({ id }: GetOrdersQuery) {
  const order = await getOrderSummary(id);
  return order;
}
