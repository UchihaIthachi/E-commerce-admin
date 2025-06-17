import { initTRPC } from '@trpc/server';
import type { Context } from './context';
import superjson from 'superjson'; // For data serialization (handles Dates, etc.)

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson, // Enable superjson transformer
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.auth.userId` is present.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  // ctx.auth is inferred from the context setup in context.ts
  // It can be SignedInAuthObject | SignedOutAuthObject | null
  if (!ctx.auth || !ctx.auth.userId) {
    throw new t.TRPCError({ code: 'UNAUTHORIZED', message: 'User is not authenticated' });
  }
  return next({
    ctx: {
      // Now infers `auth` as `SignedInAuthObject`
      // and `ctx.auth.userId` as non-nullable string
      auth: ctx.auth,
    },
  });
});
