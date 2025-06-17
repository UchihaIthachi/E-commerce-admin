import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }), // Min length 1, actual length check can be server-side
});

export const RegisterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).max(255, "Name must be 255 characters or less"),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100, "Password must be 100 characters or less"),
});

export const RequestPasswordResetSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Token is required" }), // Basic check, could be more specific
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters" }).max(100, "New password must be 100 characters or less"),
});
