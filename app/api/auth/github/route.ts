import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('[GitHub OAuth] Starting authentication flow');
    console.log('[GitHub OAuth] All env vars:', Object.keys(process.env).filter(k => k.includes('GITHUB') || k.includes('GOOGLE') || k.includes('JWT')));
    console.log('[GitHub OAuth] GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID);
    console.log('[GitHub OAuth] GITHUB_REDIRECT_URI:', process.env.GITHUB_REDIRECT_URI);
    console.log('[GitHub OAuth] GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? 'SET' : 'MISSING');

    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      console.error('[GitHub OAuth] Missing configuration:', { clientId: !!clientId, redirectUri: !!redirectUri });
      return NextResponse.json({ error: 'GitHub OAuth is not configured' }, { status: 500 });
    }

    // GitHub OAuth authorize URL 생성
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', clientId);
    githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
    githubAuthUrl.searchParams.set('scope', 'read:user user:email');

    console.log('[GitHub OAuth] Redirecting to:', githubAuthUrl.toString());

    // GitHub 로그인 페이지로 리다이렉트
    return NextResponse.redirect(githubAuthUrl.toString());
  } catch (error) {
    console.error('[GitHub OAuth] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
