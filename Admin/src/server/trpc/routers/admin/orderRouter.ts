import { router, protectedProcedure } from '../../../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import getOrdersQueryHandler from '@/server/application/features/order/queries/get-orders-query-handler';
import getOrderQueryHandler from '@/server/application/features/order/queries/get-order-query-handler';
import updateOrderCommandHandler from '@/server/application/features/order/commands/update-order-command-handler';
import getTotalOrdersCountQueryHandler from '@/server/application/features/order/queries/get-total-orders-count-query-handler';

import {
  OrderFilters,
  GetOrderDTO, // Assuming this is the DTO for list items
  GetOrderSummaryDTO, // Assuming this is for a single detailed order
  UpdateOrderDTO, // DTO for updates (order_status, payment_status, delivery_status)
  OrderStatusFieldDTO, // For specific status updates if needed, or part of UpdateOrderDTO
  PaymentStatusFieldDTO,
  DeliveryStatusFieldDTO
} from '@/server/application/common/dtos/order';

export const adminOrderRouter = router({
  getAll: protectedProcedure
    .input(OrderFilters) // Input schema for filters
    .output(z.array(GetOrderDTO)) // Assuming GetOrderDTO is for items in a list
    .query(async ({ input, ctx }) => {
      const orders = await getOrdersQueryHandler(input);
      return orders;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(GetOrderSummaryDTO) // Assuming GetOrderSummaryDTO is for a single detailed order
    .query(async ({ input, ctx }) => {
      const order = await getOrderQueryHandler({ id: input.id });
      if (!order) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
      }
      return order;
    }),

  update: protectedProcedure
    .input(UpdateOrderDTO.extend({ id: z.string() })) // Include id in the input
    .output(z.object({ success: z.boolean(), message: z.string() })) // Or return the updated order
    .mutation(async ({ input, ctx }) => {
      const { id, ...dataToUpdate } = input;
      try {
        // updateOrderCommandHandler might return void or the updated entity.
        // If it returns the entity, the .output() can be changed to GetOrderSummaryDTO.
        await updateOrderCommandHandler({ id, ...dataToUpdate });
        return { success: true, message: 'Order updated successfully.' };
      } catch (error: any) {
        throw new TRPCError({
          code: error.name === 'VALIDATION_ERROR' ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update order.',
          cause: error,
        });
      }
    }),

  // Example of specific status update if needed, though `update` with UpdateOrderDTO might cover it.
  // updateOrderStatus: protectedProcedure
  //   .input(z.object({ id: z.string(), order_status: OrderStatusFieldDTO }))
  //   .output(GetOrderSummaryDTO) // Or a success message
  //   .mutation(async ({ input, ctx }) => {
  //     await updateOrderCommandHandler({ id: input.id, order_status: input.order_status });
  //     const updatedOrder = await getOrderQueryHandler({ id: input.id });
  //     if (!updatedOrder) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch updated order.'});
  //     return updatedOrder;
  //   }),

  getTotalCount: protectedProcedure
    .output(z.object({ count: z.number() }))
    .query(async ({ ctx }) => {
      const count = await getTotalOrdersCountQueryHandler();
      return { count };
    }),
});
