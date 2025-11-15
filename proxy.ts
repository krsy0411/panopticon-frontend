import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/jwt';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 인증이 필요 없는 경로
  const publicPaths = ['/auth', '/api/auth'];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  if (isPublicPath) {
    return NextResponse.next();
  }

  // JWT 토큰 확인
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // JWT 검증
  const { valid } = await verifyJwt(token);

  if (!valid) {
    const response = NextResponse.redirect(new URL('/auth', request.url));
    response.cookies.delete('auth-token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
