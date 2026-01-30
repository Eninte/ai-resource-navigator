import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminFromRequestEdge } from './lib/auth-edge';

// Paths that require admin authentication
const PROTECTED_PATHS = ['/admin/dashboard'];

// Paths that are only accessible when NOT authenticated (e.g., login)
const AUTH_PATHS = ['/admin/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected path
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  // Check if this is an auth-only path (login page)
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  // Get admin from request (Edge-compatible)
  const admin = await getAdminFromRequestEdge(request);
  const isAuthenticated = !!admin;

  // Redirect logic
  if (isProtectedPath && !isAuthenticated) {
    // Redirect to login if trying to access protected page without auth
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isAuthPath && isAuthenticated) {
    // Redirect to dashboard if already authenticated and trying to access login
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
