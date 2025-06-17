import { inferAsyncReturnType } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getAuth, SignedInAuthObject, SignedOutAuthObject } from '@clerk/nextjs/server';
// import type { NextApiRequest } from 'next'; // NextApiRequest might not be needed if opts.req is correctly typed by CreateNextContextOptions

/**
 * Defines your inner context shape.
 * Add fields here that the inner context brings.
 */
interface CreateInnerContextOptions {
  auth: SignedInAuthObject | SignedOutAuthObject | null; // Clerk's getAuth can return null if used outside of Next.js request lifecycle or if Clerk isn't set up
}

/**
 * Inner context. Will always be available in your procedures, even if the user is not signed in.
 * This is the actual context shape that will be available in your procedures.
 */
export async function createContextInner(opts: CreateInnerContextOptions) {
  return {
    auth: opts.auth,
  };
}

/**
 * Creates context for an incoming request.
 * @link https://trpc.io/docs/context
 */
export async function createContext(opts: CreateNextContextOptions) {
  // Get the auth object from Clerk
  // Note: `opts.req` is typed as `NextApiRequest | IncomingMessage`.
  // `getAuth` expects `NextApiRequest` or `Request`.
  // Casting to `NextApiRequest` might be necessary if the type isn't automatically inferred or compatible.
  // However, `CreateNextContextOptions` from `@trpc/server/adapters/next` usually provides `req` in a compatible way for Next.js environments.
  const auth = getAuth(opts.req);

  // Pass the auth object to the inner context
  return await createContextInner({ auth });
}

export type Context = inferAsyncReturnType<typeof createContextInner>;
