/**
 * Authentication Validation Schemas
 *
 * Zod schemas for validating authentication-related requests.
 * Provides type-safe validation with detailed error messages.
 *
 * Validation Rules:
 * - Email: Must be valid email format
 * - Password: Minimum 8 characters, at least 1 letter and 1 number
 * - Display Name: Optional, max 80 characters, trimmed
 */

import { z } from 'zod';

/**
 * Signup request validation schema
 *
 * Validates the request body for POST /api/signup
 */
export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  displayName: z
    .string()
    .trim()
    .max(80, 'Display name must be 80 characters or less')
    .optional()
    .nullable()
    .transform((val) => val || null), // Convert empty string to null
});

/**
 * Inferred TypeScript type from signup schema
 *
 * Use this type for type-safe access to validated signup data
 *
 * @example
 * ```ts
 * const input: SignupInput = {
 *   email: 'user@example.com',
 *   password: 'SecurePass123',
 *   displayName: 'John Doe',
 * };
 * ```
 */
export type SignupInput = z.infer<typeof signupSchema>;

/**
 * Login request validation schema (for future use)
 *
 * Validates the request body for POST /api/login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(1, 'Password is required'),
});

/**
 * Inferred TypeScript type from login schema
 */
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Password reset request validation schema (for future use)
 */
export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
});

/**
 * Inferred TypeScript type from password reset request schema
 */
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;

/**
 * Helper to format Zod validation errors for API responses
 *
 * Converts Zod error into a friendly object for the error details field
 *
 * @param {z.ZodError} error - Zod validation error
 * @returns {Record<string, string>} Field-level error messages
 *
 * @example
 * ```ts
 * const result = signupSchema.safeParse(body);
 * if (!result.success) {
 *   const errors = formatZodError(result.error);
 *   // { email: "Invalid email address", password: "Password must be at least 8 characters" }
 * }
 * ```
 */
export function formatZodError(error: z.ZodError<any>): Record<string, string> {
  const formatted: Record<string, string> = {};

  error.issues.forEach((err) => {
    const path = err.path.join('.');
    formatted[path] = err.message;
  });

  return formatted;
}
