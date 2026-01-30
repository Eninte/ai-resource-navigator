import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface JWTPayload {
  role: 'admin';
  ipHash: string;
  iat: number;
  exp: number;
}

/**
 * 验证 JWT Token (Edge Runtime compatible)
 */
export async function verifyJWTEdge(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as unknown as JWTPayload;
}

/**
 * 从请求中获取管理员信息 (Edge Runtime compatible)
 */
export async function getAdminFromRequestEdge(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) return null;

    const payload = await verifyJWTEdge(token);
    
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
