import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { NextRequest } from 'next/server';

// Login Limiter: Max 10 attempts per IP per 15 minutes.
const MAX_LOGIN_ATTEMPTS_PER_IP = 10;
const LOGIN_WINDOW_DURATION_SECONDS = 15 * 60;

// Register Limiter: Max 5 attempts per IP per hour.
const MAX_REGISTER_ATTEMPTS_PER_IP = 5;
const REGISTER_WINDOW_DURATION_SECONDS = 60 * 60;

// Password Reset Limiter: Max 3 attempts per IP per hour.
const MAX_PASSWORD_RESET_ATTEMPTS_PER_IP = 3;
const PASSWORD_RESET_WINDOW_DURATION_SECONDS = 60 * 60;

// Refresh Token Limiter: Max 20 attempts per IP per hour.
// User-based limiting for refresh is complex here as user is not yet authenticated.
// IP-based is a practical first step.
const MAX_REFRESH_ATTEMPTS_PER_IP = 20;
const REFRESH_WINDOW_DURATION_SECONDS = 60 * 60;


export const loginLimiter = new RateLimiterMemory({
  keyPrefix: 'login',
  points: MAX_LOGIN_ATTEMPTS_PER_IP,
  duration: LOGIN_WINDOW_DURATION_SECONDS,
  blockDuration: LOGIN_WINDOW_DURATION_SECONDS,
});

export const registerLimiter = new RateLimiterMemory({
  keyPrefix: 'register',
  points: MAX_REGISTER_ATTEMPTS_PER_IP,
  duration: REGISTER_WINDOW_DURATION_SECONDS,
  blockDuration: REGISTER_WINDOW_DURATION_SECONDS,
});

export const passwordResetLimiter = new RateLimiterMemory({
  keyPrefix: 'password_reset',
  points: MAX_PASSWORD_RESET_ATTEMPTS_PER_IP,
  duration: PASSWORD_RESET_WINDOW_DURATION_SECONDS,
  blockDuration: PASSWORD_RESET_WINDOW_DURATION_SECONDS,
});

export const refreshTokenLimiter = new RateLimiterMemory({
  keyPrefix: 'refresh_token',
  points: MAX_REFRESH_ATTEMPTS_PER_IP,
  duration: REFRESH_WINDOW_DURATION_SECONDS,
  blockDuration: REFRESH_WINDOW_DURATION_SECONDS,
});

// Helper to get client IP from request
// Handles Vercel's x-forwarded-for, req.ip, and falls back.
export function getClientIp(req: NextRequest): string {
    let ip = req.ip ?? req.headers.get('x-real-ip');
    const forwardedFor = req.headers.get('x-forwarded-for');
    if (!ip && forwardedFor) {
        ip = forwardedFor.split(',').at(0) ?? 'unknown';
    }
    // Ensure it's a string and not empty, provide a fallback.
    return (typeof ip === 'string' && ip.length > 0) ? ip : 'unknown_ip';
}

// Helper function to consume limiter and handle errors
export async function consumeLimiter(
    limiter: RateLimiterMemory,
    key: string,
    errorMessage: string = 'Too many requests. Please try again later.'
): Promise<boolean> {
    try {
        await limiter.consume(key);
        return true; // Allowed
    } catch (rlRejected) {
        if (rlRejected instanceof RateLimiterRes) {
            // Rate limited
            return false; // Blocked
        }
        // Some other error
        console.error("Rate limiter unexpected error:", rlRejected);
        throw rlRejected; // Re-throw unexpected errors
    }
}
