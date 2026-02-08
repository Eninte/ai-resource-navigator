import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminFromRequestEdge } from './lib/auth-edge';

const PROTECTED_PATHS = ['/admin/dashboard'];

const AUTH_PATHS = ['/admin/login'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  const admin = await getAdminFromRequestEdge(request);
  const isAuthenticated = !!admin;

  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
