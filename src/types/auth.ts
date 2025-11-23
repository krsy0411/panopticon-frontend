/**
 * 인증 관련 타입 정의
 */

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
  role?: string;
  provider?: string | null;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  github_id?: string;
  google_id?: string;
  login?: string;
  avatar_url?: string;
}

export interface AuthResponse {
  authenticated: boolean;
  user?: User;
}
