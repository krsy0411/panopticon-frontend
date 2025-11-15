/**
 * 인증 관련 타입 정의
 */

export interface User {
  id: string;
  github_id?: string;
  google_id?: string;
  login: string;
  email: string;
  avatar_url: string;
  provider: 'github' | 'google';
}

export interface AuthResponse {
  authenticated: boolean;
  user?: User;
}
