import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/jwt';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { valid, payload } = await verifyJwt(token);

    if (!valid || !payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: payload.sub,
        github_id: payload.github_id,
        google_id: payload.google_id,
        login: payload.login,
        email: payload.email,
        avatar_url: payload.avatar_url,
        provider: payload.provider,
      },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
