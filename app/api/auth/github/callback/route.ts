/**
 * GitHub OAuth 콜백 엔드포인트
 * GET /api/auth/github/callback
 */

import { NextRequest, NextResponse } from 'next/server';
import { createJwt } from '@/lib/jwt';

/**
 * GitHub OAuth 토큰 응답
 */
interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

/**
 * GitHub 사용자 정보
 */
interface GitHubUser {
  id: number;
  login: string;
  email: string | null;
  avatar_url: string;
  name: string | null;
}

/**
 * GitHub 이메일 정보
 */
interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Authorization code not found' }, { status: 400 });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = process.env.GITHUB_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json({ error: 'GitHub OAuth is not configured' }, { status: 500 });
    }

    // 1. GitHub에서 access_token 획득
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token from GitHub');
    }

    const tokenData: GitHubTokenResponse = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. access_token으로 사용자 정보 가져오기
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info from GitHub');
    }

    const githubUser: GitHubUser = await userResponse.json();

    // 3. 이메일 정보 가져오기 (유저 정보에 이메일이 없는 경우)
    let email = githubUser.email;

    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (emailResponse.ok) {
        const emails: GitHubEmail[] = await emailResponse.json();
        const primaryEmail = emails.find((e) => e.primary && e.verified);
        email = primaryEmail?.email || emails[0]?.email || '';
      }
    }

    if (!email) {
      return NextResponse.json({ error: 'Could not retrieve email from GitHub' }, { status: 400 });
    }

    // 4. JWT 생성
    const jwt = await createJwt({
      github_id: String(githubUser.id),
      login: githubUser.login,
      email,
      avatar_url: githubUser.avatar_url,
      provider: 'github',
    });

    // 5. 쿠키에 JWT 저장하고 메인 페이지로 리다이렉트
    // 프로덕션에서는 실제 호스트를 사용, 개발에서는 request.url 사용
    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = host && !host.includes('0.0.0.0') && !host.match(/^[a-f0-9]{12}:/)
      ? `${protocol}://${host}`
      : request.url.replace(/\/api\/auth\/github\/callback.*$/, '');

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
    console.error('GitHub OAuth callback error:', error);
    return NextResponse.redirect(new URL('/auth?error=github_auth_failed', request.url));
  }
}
