// src/server/trpc/routers/admin/dashboard.ts
import { router, publicProcedure } from '../../../trpc'; // Adjust path as needed
import getTotalOrdersCountQueryHandler from '@/server/application/features/order/queries/get-total-orders-count-query-handler';
import { z } from 'zod';

export const adminDashboardRouter = router({
  getTotalOrdersCount: publicProcedure
    .output(z.number()) // Expecting a number as output
    .query(async () => {
      const count = await getTotalOrdersCountQueryHandler();
      return count;
    }),

  // Add more dashboard-related procedures here in the future
});
