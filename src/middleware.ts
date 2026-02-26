import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Handle short links - redirect trailing slash to non-trailing slash
  if (pathname.startsWith('/s/') && pathname.endsWith('/') && pathname.length > 3) {
    const newUrl = new URL(pathname.slice(0, -1), url.origin);
    newUrl.search = url.search;
    return NextResponse.redirect(newUrl);
  }

  // Handle trailing slashes for other paths (but NOT short links)
  if (!pathname.startsWith('/s/') && !pathname.endsWith('/') && !pathname.includes('.')) {
    const newUrl = new URL(pathname + '/', url.origin);
    newUrl.search = url.search;
    return NextResponse.redirect(newUrl);
  }

  // Add security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [],
};
