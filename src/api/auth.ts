/**
 * 인증 관련 API 호출 함수들
 * panopticon_authserver와 통신합니다.
 * 쿠키 기반 인증(httpOnly auth-token 쿠키)을 사용합니다.
 */

// ==================== 타입 정의 ====================

export interface AuthTokenResponse {
  token: string;
  user: {
    id: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

// ==================== API Base URL ====================

const getAuthServerUrl = (): string => {
  return process.env.NEXT_PUBLIC_AUTH_API_BASE_URL || 'http://localhost:8080';
};

// ==================== Fetch 헬퍼 ====================

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  try {
    const baseUrl = getAuthServerUrl();
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    });

    return response.ok;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

export async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getAuthServerUrl();
  const fullUrl = `${baseUrl}${url}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  let response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include',
  });

  // 401 (Unauthorized) 에러인 경우, 토큰 갱신 시도
  if (response.status === 401) {
    // 이미 갱신 중이면 그 결과를 기다림
    if (isRefreshing) {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken();
      }
      const refreshed = await refreshPromise;
      refreshPromise = null;
      isRefreshing = false;

      if (refreshed) {
        // 토큰 갱신 성공 후 원래 요청 재시도
        response = await fetch(fullUrl, {
          ...options,
          headers,
          credentials: 'include',
        });
      } else {
        // 토큰 갱신 실패 시 에러 발생
        throw new Error('Failed to refresh authentication token');
      }
    } else {
      // 첫 번째 갱신 시도
      isRefreshing = true;
      refreshPromise = refreshAccessToken();
      const refreshed = await refreshPromise;
      refreshPromise = null;
      isRefreshing = false;

      if (refreshed) {
        // 토큰 갱신 성공 후 원래 요청 재시도
        response = await fetch(fullUrl, {
          ...options,
          headers,
          credentials: 'include',
        });
      } else {
        // 토큰 갱신 실패 시 에러 발생
        throw new Error('Failed to refresh authentication token');
      }
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Could not parse error response as JSON
    }

    throw new Error(errorMessage);
  }

  // 응답 본문이 없으면 undefined 반환
  const contentLength = response.headers.get('content-length');
  if (contentLength === '0' || !contentLength) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ==================== API 함수들 ====================

/**
 * POST /auth/logout
 * 로그아웃 (refresh token 무효화)
 */
export const logoutUser = async (): Promise<void> => {
  await fetchWithAuth<void>('/auth/logout', {
    method: 'POST',
  });
};
