import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/jwt';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 인증이 필요 없는 경로
  const publicPaths = ['/', '/auth', '/api/auth'];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // 만약 랜딩('/')에 접근 중이고 이미 auth-token 쿠키가 있으면
  // 유효성 검증 후 바로 /services로 리다이렉트합니다.
  const token = request.cookies.get('auth-token')?.value;
  if (pathname === '/' && token) {
    try {
      const { valid } = await verifyJwt(token);
      if (valid) {
        return NextResponse.redirect(new URL('/services', request.url));
      }
    } catch {
      // 검증 실패 시에는 그냥 계속 진행하도록 둡니다.
    }
  }

  if (isPublicPath) {
    return NextResponse.next();
  }

  // JWT 토큰 확인 (비공개 경로 접근 시 필수)
  const tokenForProtected = token || request.cookies.get('auth-token')?.value;

  if (!tokenForProtected) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // JWT 검증
  const { valid } = await verifyJwt(tokenForProtected);

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
