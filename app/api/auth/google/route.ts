import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Google OAuth is not configured' }, { status: 500 });
  }

  // Google OAuth authorize URL 생성
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid profile email');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'consent');

  // Google 로그인 페이지로 리다이렉트
  return NextResponse.redirect(googleAuthUrl.toString());
}
