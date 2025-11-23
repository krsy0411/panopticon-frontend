import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    // panopticon_authserver에 로그아웃 요청 (선택사항)
    if (token) {
      const authApiBase = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL;
      if (authApiBase) {
        try {
          await fetch(`${authApiBase.replace(/\/$/, '')}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (e) {
          console.error('[Auth] Error calling authserver logout:', e);
          // Continue with local logout even if authserver call fails
        }
      }
    }

    // 쿠키 삭제
    const response = NextResponse.json({ success: true });
    response.cookies.delete('auth-token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    // panopticon_authserver에 로그아웃 요청 (선택사항)
    if (token) {
      const authApiBase = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL;
      if (authApiBase) {
        try {
          await fetch(`${authApiBase.replace(/\/$/, '')}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (e) {
          console.error('[Auth] Error calling authserver logout:', e);
          // Continue with local logout even if authserver call fails
        }
      }
    }

    const response = NextResponse.redirect(new URL('/auth', request.url));
    response.cookies.delete('auth-token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect(new URL('/auth', request.url));
  }
}
