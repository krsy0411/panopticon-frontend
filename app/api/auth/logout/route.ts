import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  // 쿠키 삭제
  const response = NextResponse.json({ success: true });
  response.cookies.delete('auth-token');

  return response;
}

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/auth', request.url));
  response.cookies.delete('auth-token');

  return response;
}
