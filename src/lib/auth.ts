import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { hashIp } from './crypto-node';
import { prisma } from './db';

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
 * 生成 JWT Token
 */
export async function generateJWT(ip: string): Promise<string> {
  const ipHash = hashIp(ip);
  
  const token = await new SignJWT({ role: 'admin', ipHash })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
  
  return token;
}

/**
 * 验证 JWT Token
 */
export async function verifyJWT(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as unknown as JWTPayload;
}

/**
 * 从请求中获取管理员信息
 */
export async function getAdminFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) return null;

    const payload = await verifyJWT(token);
    
    // Verify IP hash matches (optional security check)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';
    const currentIpHash = hashIp(ip);
    
    if (payload.ipHash !== currentIpHash) {
      // IP mismatch - optional security check
      // return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * 记录管理员操作日志
 */
export async function logAdminAction(
  request: NextRequest,
  action: string,
  resourceId: string | null,
  details?: unknown
): Promise<void> {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';
    const ipHash = hashIp(ip);

    await prisma.adminLog.create({
      data: {
        action,
        ip_hash: ipHash,
        resource_id: resourceId,
        details: details || {},
      },
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}
