/**
 * @file src/lib/auth.js
 * @description Cryptographic primitives for Authentication
 * * INTENT:
 * Centralizes all security-critical logic. We use 'bcryptjs' for slow, secure
 * password hashing and 'jose' for modern, standard-compliant JWT generation.
 * This separation ensures if we rotate secrets or change algorithms, 
 * we only edit this file.
 */

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

// Configuration
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-dev-secret');
const ALG = 'HS256'; // HMAC SHA-256 algorithm

/**
 * Hash a plain text password securely.
 * @param {string} plainPassword 
 * @returns {Promise<string>}
 */
export async function hashPassword(plainPassword) {
  const saltRounds = 12; // 12 rounds is the current industry standard for speed/security balance
  return await bcrypt.hash(plainPassword, saltRounds);
}

/**
 * Compare a plain text password against a stored hash.
 * @param {string} plainPassword 
 * @param {string} hashedPassword 
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Generate a signed JWT for a user session.
 * Includes only minimal claims (sub, role) to keep the token small.
 * @param {object} payload - Must include { userId, role }
 * @returns {Promise<string>}
 */
export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('8h') // Standard work-day session
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT.
 * Throws an error if expired or tampered with.
 * @param {string} token 
 * @returns {Promise<object|null>}
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    // Intentionally swallow error details to prevent leakage to client
    return null;
  }
}