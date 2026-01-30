/**
 * Edge Runtime compatible crypto functions
 * Uses Web Crypto API instead of Node.js crypto
 */

/**
 * Hash IP address using Web Crypto API (Edge Runtime compatible)
 */
export async function hashIpEdge(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (process.env.IP_SALT || 'default-salt'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify admin password (Edge Runtime compatible)
 */
export async function verifyPasswordEdge(password: string): Promise<boolean> {
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedHash) {
    // Fallback for development
    return password === (process.env.ADMIN_PASSWORD || 'admin123');
  }
  
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hash === expectedHash;
}
