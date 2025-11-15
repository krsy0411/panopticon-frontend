/**
 * Google OAuth 콜백 엔드포인트
 * GET /api/auth/google/callback
 */

import { NextRequest, NextResponse } from 'next/server';
import { createJwt } from '@/lib/jwt';

/**
 * Google OAuth 토큰 응답
 */
interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
  id_token?: string;
}

/**
 * Google 사용자 정보
 */
interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Authorization code not found' }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json({ error: 'Google OAuth is not configured' }, { status: 500 });
    }

    // Google에 요청해서 access_token 획득
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token from Google');
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // access_token으로 사용자 정보 가져오기
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info from Google');
    }

    const googleUser: GoogleUserInfo = await userResponse.json();

    // 이메일 검증 확인
    if (!googleUser.verified_email) {
      return NextResponse.json({ error: 'Email is not verified' }, { status: 400 });
    }

    // JWT 생성
    const jwt = await createJwt({
      google_id: googleUser.id,
      login: googleUser.name || googleUser.email.split('@')[0],
      email: googleUser.email,
      avatar_url: googleUser.picture,
      provider: 'google',
    });

    // 쿠키에 JWT 저장하고 메인 페이지로 리다이렉트
    // 프로덕션에서는 실제 호스트를 사용, 개발에서는 request.url 사용
    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = host && !host.includes('0.0.0.0') && !host.match(/^[a-f0-9]{12}:/)
      ? `${protocol}://${host}`
      : request.url.replace(/\/api\/auth\/google\/callback.*$/, '');

    const response = NextResponse.redirect(`${baseUrl}/apps`);
    response.cookies.set('auth-token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/auth?error=google_auth_failed', request.url));
  }
}
