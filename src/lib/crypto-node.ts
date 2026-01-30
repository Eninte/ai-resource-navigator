// Node.js specific crypto functions
import crypto from 'crypto';

/**
 * Hash IP address for privacy compliance
 */
export function hashIp(ip: string): string {
  return crypto
    .createHash('sha256')
    .update(ip + (process.env.IP_SALT || 'default-salt'))
    .digest('hex');
}

// Alias for hashIp (for backward compatibility)
export const hashIP = hashIp;

/**
 * Hash for deduplication (8-character prefix)
 */
export function hashForDedup(input: string): string {
  return crypto
    .createHash('sha256')
    .update(input)
    .digest('hex')
    .substring(0, 8);
}

/**
 * Verify admin password
 */
export function verifyPassword(password: string): boolean {
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedHash) {
    // Fallback for development
    return password === (process.env.ADMIN_PASSWORD || 'admin123');
  }
  
  const hash = crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
  
  return hash === expectedHash;
}
