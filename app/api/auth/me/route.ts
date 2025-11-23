import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // panopticon_authserver의 /users/me 엔드포인트 호출
    const authApiBase = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL;

    if (!authApiBase) {
      return NextResponse.json(
        { authenticated: false, error: 'Auth server is not configured' },
        { status: 500 },
      );
    }

    const authResponse = await fetch(`${authApiBase.replace(/\/$/, '')}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.text();
      console.error('[Auth] Auth server error response:', {
        status: authResponse.status,
        body: errorData,
      });

      if (authResponse.status === 401) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
      }
      throw new Error(`Auth server responded with status ${authResponse.status}: ${errorData}`);
    }

    const userData = await authResponse.json();

    return NextResponse.json({
      authenticated: true,
      user: userData,
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Failed to fetch user info' },
      { status: 500 },
    );
  }
}
