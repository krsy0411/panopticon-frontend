import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('[Google OAuth] Starting authentication flow');
    console.log(
      '[Google OAuth] GOOGLE_CLIENT_ID:',
      process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING',
    );
    console.log(
      '[Google OAuth] GOOGLE_REDIRECT_URI:',
      process.env.GOOGLE_REDIRECT_URI ? 'SET' : 'MISSING',
    );

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      console.error('[Google OAuth] Missing configuration:', {
        clientId: !!clientId,
        redirectUri: !!redirectUri,
      });
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

    console.log('[Google OAuth] Redirecting to:', googleAuthUrl.toString());

    // Google 로그인 페이지로 리다이렉트
    return NextResponse.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error('[Google OAuth] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
