import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.URL_SIGNING_SECRET || 'dev-secret-key-change-in-prod-123456789'
);

const ALG = 'HS256';

export async function generateToken(resourceId: string): Promise<string> {
  return new SignJWT({ rid: resourceId })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('2h') // Token valid for 2 hours
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string, resourceId: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload.rid === resourceId;
  } catch (error) {
    return false;
  }
}
