import { inferAsyncReturnType } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';

/**
 * Creates context for an incoming request.
 * @link https://trpc.io/docs/context
 */
export async function createContext(opts: CreateNextContextOptions) {
  // for now, we'll just return an empty object, but you can add session, db connection, etc.
  return {};
}

export type Context = inferAsyncReturnType<typeof createContext>;
