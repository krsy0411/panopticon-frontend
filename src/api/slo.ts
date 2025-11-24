/**
 * SLO API 호출 함수들
 * panopticon_authserver와 통신하여 SLO 설정을 관리합니다.
 * 쿠키 기반 인증(httpOnly auth-token cookie)을 사용합니다.
 */

// ==================== 타입 정의 ====================

export interface SloResponse {
  id: string;
  userId: string;
  name: string;
  metric: 'availability' | 'latency' | 'error_rate';
  target: number;
  sliValue: number;
  actualDowntimeMinutes: number;
  totalMinutes: number;
  connectedChannels: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSloDto {
  name: string;
  metric: 'availability' | 'latency' | 'error_rate';
  target: number;
  sliValue?: number;
  actualDowntimeMinutes?: number;
  totalMinutes: number;
  connectedChannels?: string[];
  description?: string;
}

export interface UpdateSloDto {
  name?: string;
  metric?: 'availability' | 'latency' | 'error_rate';
  target?: number;
  sliValue?: number;
  actualDowntimeMinutes?: number;
  totalMinutes?: number;
  connectedChannels?: string[];
  description?: string;
}

// ==================== API Base URL ====================

const getAuthServerUrl = (): string => {
  return process.env.NEXT_PUBLIC_AUTH_API_BASE_URL || 'http://localhost:8080';
};

// ==================== Fetch 헬퍼 ====================

async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getAuthServerUrl();
  const fullUrl = `${baseUrl}${url}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 쿠키 자동 포함 (credentials: 'include')
  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include',
  });

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

  const contentLength = response.headers.get('content-length');
  if (contentLength === '0' || !contentLength) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ==================== API 함수들 ====================

/**
 * POST /auth/slos
 * 새로운 SLO 생성
 */
export const createSlo = async (data: CreateSloDto): Promise<SloResponse> => {
  return fetchWithAuth<SloResponse>('/auth/slos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * GET /auth/slos
 * 사용자의 모든 SLO 조회
 */
export const getSlos = async (): Promise<SloResponse[]> => {
  return fetchWithAuth<SloResponse[]>('/auth/slos', {
    method: 'GET',
  });
};

/**
 * GET /auth/slos/:sloId
 * 특정 SLO 조회
 */
export const getSlo = async (sloId: string): Promise<SloResponse> => {
  return fetchWithAuth<SloResponse>(`/auth/slos/${sloId}`, {
    method: 'GET',
  });
};

/**
 * PATCH /auth/slos/:sloId
 * SLO 업데이트
 */
export const updateSlo = async (sloId: string, data: UpdateSloDto): Promise<SloResponse> => {
  return fetchWithAuth<SloResponse>(`/auth/slos/${sloId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE /auth/slos/:sloId
 * SLO 삭제
 */
export const deleteSlo = async (sloId: string): Promise<void> => {
  await fetchWithAuth<void>(`/auth/slos/${sloId}`, {
    method: 'DELETE',
  });
};
