import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Login/register are no longer used; always send users to dashboard.
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // WhatsApp webhook: X-Webhook-Secret or Bearer token
  if (pathname === '/api/webhook/whatsapp') {
    const webhookSecret = process.env.WEBHOOK_SECRET;
    const secretHeader = request.headers.get('x-webhook-secret');
    const authHeader = request.headers.get('authorization');
    const hasSecret = webhookSecret && secretHeader === webhookSecret;
    const hasBearer = authHeader?.startsWith('Bearer ');
    if (!hasSecret && !hasBearer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
