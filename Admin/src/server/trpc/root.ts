import { router, publicProcedure } from './trpc';
import { adminBannerRouter } from './routers/admin/banner';
import { adminColorRouter } from './routers/admin/color';
import { adminSizeRouter } from './routers/admin/size';
import { adminDashboardRouter } from './routers/admin/dashboard';
import { adminGridItemRouter } from './routers/admin/gridItemRouter';
import { adminCategoryRouter } from './routers/admin/categoryRouter';
import { adminSubCategoryRouter } from './routers/admin/subcategoryRouter';
import { adminImageRouter } from './routers/admin/imageRouter';
import { adminOrderRouter } from './routers/admin/orderRouter';
import { adminProductRouter } from './routers/admin/productRouter';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'), // A simple healthcheck endpoint
  adminBanner: adminBannerRouter,
  adminColor: adminColorRouter,
  adminSize: adminSizeRouter,
  adminDashboard: adminDashboardRouter,
  adminGridItem: adminGridItemRouter,
  adminCategory: adminCategoryRouter,
  adminSubCategory: adminSubCategoryRouter,
  adminImage: adminImageRouter,
  adminOrder: adminOrderRouter,
  adminProduct: adminProductRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
