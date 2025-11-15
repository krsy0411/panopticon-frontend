import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'GitHub OAuth is not configured' }, { status: 500 });
  }

  // GitHub OAuth authorize URL 생성
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId);
  githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
  githubAuthUrl.searchParams.set('scope', 'read:user user:email');

  // GitHub 로그인 페이지로 리다이렉트
  return NextResponse.redirect(githubAuthUrl.toString());
}
