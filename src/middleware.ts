import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function buildCspHeader(nonce: string): string {
  const isDev = process.env.NODE_ENV !== 'production';
  const scriptSrc = isDev
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;
  const directives = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https://cdn.discordapp.com data:",
    "connect-src 'self'",
    "font-src 'self'",
    "frame-ancestors 'none'",
    'report-uri /api/csp-report',
  ];
  return directives.join('; ');
}

export async function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCspHeader(nonce);

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  const isSecure =
    request.headers.get('x-forwarded-proto') === 'https' ||
    process.env.NODE_ENV === 'production' ||
    process.env.NEXTAUTH_URL?.startsWith('https://');

  const token = await getToken({
    req: request,
    secret,
    secureCookie: isSecure,
  });

  const adminRoles = ['ADMIN', 'TIPSTER'];
  if (!token || !adminRoles.includes(token.role as string)) {
    const url = request.nextUrl.clone();
    url.pathname = '/404-not-found-trigger';
    const res = NextResponse.rewrite(url);
    res.headers.set('Content-Security-Policy-Report-Only', csp);
    return res;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);
  requestHeaders.set('x-nonce', nonce);

  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (forwardedHost) {
    requestHeaders.set('x-forwarded-host', forwardedHost);
  }

  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  requestHeaders.set('x-forwarded-proto', forwardedProto);

  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  res.headers.set('Content-Security-Policy-Report-Only', csp);
  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
