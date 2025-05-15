import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Define public paths that don't require authentication
const PUBLIC_PATHS = ['/login', '/api/auth/login'];

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  console.log('Middleware executing for path:', path);

  // Check if the current path is public
  const isPublicPath = PUBLIC_PATHS.includes(path);
  console.log('Is public path:', isPublicPath);

  // Get the token from the cookies
  const token = request.cookies.get('auth-token')?.value;
  console.log('Token present:', !!token);

  // Special handling for root path
  if (path === '/') {
    if (!token) {
      console.log('No token found, redirecting to login from root path');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    console.log('Token found, allowing access to root path');
    return NextResponse.next();
  }

  // If trying to access login page while logged in, redirect to home
  if (isPublicPath && token) {
    console.log('Redirecting to home - user is logged in');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If trying to access protected page without token, redirect to login
  if (!isPublicPath && !token) {
    console.log('Redirecting to login - no token found');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token for protected routes
  if (!isPublicPath && token) {
    try {
      console.log('Verifying token');
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
      console.log('Token verified successfully');
    } catch (error) {
      console.error('Token verification failed:', error);
      // If token is invalid, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  console.log('Middleware completed successfully');
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 