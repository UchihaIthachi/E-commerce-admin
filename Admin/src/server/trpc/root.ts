import { router, publicProcedure } from './trpc';
import { adminBannerRouter } from './routers/admin/banner';
import { adminColorRouter } from './routers/admin/color';
import { adminSizeRouter } from './routers/admin/size';
import { adminDashboardRouter } from './routers/admin/dashboard';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'), // A simple healthcheck endpoint
  adminBanner: adminBannerRouter,
  adminColor: adminColorRouter,
  adminSize: adminSizeRouter,
  adminDashboard: adminDashboardRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
