/**
 * Password Hashing Utilities
 *
 * Provides secure password hashing and verification using bcrypt.
 * Uses 12 salt rounds for a good balance of security and performance.
 *
 * SECURITY NOTES:
 * - Never log or return plaintext passwords
 * - Only store and compare hashed passwords
 * - bcrypt automatically generates and stores salt with the hash
 * - 12 rounds provides strong security as of 2024
 */

import bcrypt from 'bcryptjs';

/**
 * Number of salt rounds for bcrypt hashing
 * Higher = more secure but slower
 * 12 rounds is recommended for 2024+ applications
 */
const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt
 *
 * @param {string} plainPassword - The plaintext password to hash
 * @returns {Promise<string>} The bcrypt hash (includes salt)
 *
 * @throws {Error} If hashing fails
 *
 * @example
 * ```ts
 * const hash = await hashPassword('mySecurePassword123');
 * // Returns: $2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW
 * ```
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  try {
    const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hash;
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a plaintext password against a bcrypt hash
 *
 * @param {string} plainPassword - The plaintext password to verify
 * @param {string} hash - The bcrypt hash to compare against
 * @returns {Promise<boolean>} True if password matches, false otherwise
 *
 * @example
 * ```ts
 * const isValid = await verifyPassword('mySecurePassword123', storedHash);
 * if (isValid) {
 *   // Password is correct
 * }
 * ```
 */
export async function verifyPassword(
  plainPassword: string,
  hash: string
): Promise<boolean> {
  try {
    const isValid = await bcrypt.compare(plainPassword, hash);
    return isValid;
  } catch (error) {
    // If comparison fails, treat as invalid password
    return false;
  }
}
