import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

// Updated Matcher: Run on most paths, excluding specific static assets and some API routes.
// Note: /api/auth/ will still be matched by this and handled by publicPaths logic.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt
     * - sitemap.xml
     * - public (public assets folder)
     * - manifest.json or other PWA assets if any (e.g. /icons/)
     * The goal is to apply middleware to actual pages and dynamic API routes.
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|public|manifest.json|icons/).*)',
  ],
};

const publicPaths = [
  '/', // Home page
  '/sign-in',
  '/sign-up',
  '/request-password-reset',
  '/reset-password', // This will match /reset-password and /reset-password?token=...
  '/api/auth', // All auth API routes like /api/auth/login, /api/auth/google/callback etc.
  // Add other public pages like /products, /category if they are meant to be public by default
  // For now, assuming only auth-related pages and home are public.
  // Example:
  // '/products',
  // '/category',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow NextAuth specific paths (if it were used, good pattern to keep for other similar tools)
  // Example: if (pathname.startsWith('/api/auth/')) return NextResponse.next();
  // For our custom auth, /api/auth/* is in publicPaths.

  // Check if JWT_ACCESS_SECRET is configured.
  if (!JWT_ACCESS_SECRET) {
    console.error('CRITICAL: JWT_ACCESS_SECRET is not defined. Middleware protection is effectively disabled for matched paths.');
    // Depending on security posture, you might want to block access or be permissive.
    // Being permissive here to avoid full site lockout on misconfiguration.
    return NextResponse.next();
  }

  // Check if the current path is one of the public paths
  const isPublicPath = publicPaths.some(path => {
    if (path.endsWith('/:path*') || path.endsWith('/*')) { // Handle wildcard paths if any are defined this way
        return pathname.startsWith(path.substring(0, path.lastIndexOf('/')));
    }
    return pathname === path || (path !== '/' && pathname.startsWith(path + '/')) || pathname.startsWith(path + '?');
  });

  // Specifically allow /api/auth routes (already covered by publicPaths.some with `/api/auth`)
  // This explicit check can be redundant if publicPaths is comprehensive but adds clarity.
  if (pathname.startsWith('/api/auth/')) {
      return NextResponse.next();
  }


  if (isPublicPath) {
    return NextResponse.next();
  }

  // If not a public path, proceed with token verification (protected path logic)
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname + request.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  try {
    const decodedToken = jwt.verify(accessToken, JWT_ACCESS_SECRET) as JwtPayload & { userId?: string; email?: string; role?: string };

    const requestHeaders = new Headers(request.headers);
    if (decodedToken.userId) requestHeaders.set('x-user-id', decodedToken.userId);
    if (decodedToken.email) requestHeaders.set('x-user-email', decodedToken.email);
    if (decodedToken.role) requestHeaders.set('x-user-role', decodedToken.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.warn('Access token verification failed in middleware for path:', pathname, error);
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname + request.nextUrl.search);

    const response = NextResponse.redirect(signInUrl);
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });
    // No need to clear refresh_token here as its path is /api/auth,
    // and invalid access token doesn't automatically mean refresh token is bad.
    // Refresh token is handled by /api/auth/refresh endpoint.
    return response;
  }
}
