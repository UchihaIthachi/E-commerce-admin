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
// Add protectedProcedure if/when auth is integrated with tRPC context
