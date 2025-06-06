import { router, publicProcedure } from './trpc';
// Import sub-routers here when they are created, e.g.:
import { adminBannerRouter } from './routers/admin/banner';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'), // A simple healthcheck endpoint
  adminBanner: adminBannerRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
