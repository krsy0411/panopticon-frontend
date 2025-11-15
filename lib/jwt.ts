/**
 * JWT 생성 및 검증 유틸리티
 * jose 라이브러리를 사용하여 JWT 처리
 */

import { SignJWT, jwtVerify } from 'jose';

/**
 * 유저 정보 타입
 */
export interface UserInfo {
  github_id?: string;
  google_id?: string;
  login: string;
  email: string;
  avatar_url: string;
  provider: 'github' | 'google';
}

/**
 * JWT Payload 타입
 */
export interface JWTPayload extends UserInfo {
  sub: string;
  iat: number;
  exp: number;
}

/**
 * JWT Secret Key를 Uint8Array로 변환
 */
const getSecretKey = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return new TextEncoder().encode(secret);
};

/**
 * JWT 생성
 * @param userInfo - 사용자 정보
 * @param expiresIn - 만료 시간 (기본: 7일)
 * @returns JWT 토큰
 */
export async function createJwt(userInfo: UserInfo, expiresIn = '7d'): Promise<string> {
  const secret = getSecretKey();

  // sub (subject)는 provider에 따라 설정
  const sub = userInfo.provider === 'github' ? userInfo.github_id! : userInfo.google_id!;

  const jwt = await new SignJWT({
    github_id: userInfo.github_id,
    google_id: userInfo.google_id,
    login: userInfo.login,
    email: userInfo.email,
    avatar_url: userInfo.avatar_url,
    provider: userInfo.provider,
  } as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);

  return jwt;
}

/**
 * JWT 검증
 * @param token - JWT 토큰
 * @returns 검증 결과 및 payload
 */
export async function verifyJwt(token: string): Promise<{ valid: boolean; payload?: JWTPayload }> {
  try {
    const secret = getSecretKey();
    const { payload } = await jwtVerify(token, secret);

    return {
      valid: true,
      payload: {
        sub: payload.sub!,
        github_id: payload.github_id as string | undefined,
        google_id: payload.google_id as string | undefined,
        login: payload.login as string,
        email: payload.email as string,
        avatar_url: payload.avatar_url as string,
        provider: payload.provider as 'github' | 'google',
        iat: payload.iat!,
        exp: payload.exp!,
      },
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return { valid: false };
  }
}

/**
 * 쿠키에서 JWT 추출
 * @param cookieHeader - Cookie 헤더 문자열
 * @returns JWT 토큰 또는 null
 */
export function extractJwtFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const authCookie = cookies.find((c) => c.startsWith('auth-token='));

  if (!authCookie) return null;

  return authCookie.split('=')[1];
}
