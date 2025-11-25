/**
 * SLO API 호출 함수들
 * panopticon_authserver와 통신하여 SLO 설정을 관리합니다.
 * 쿠키 기반 인증(httpOnly auth-token cookie)을 사용합니다.
 */

import { fetchWithAuth } from './auth';

// ==================== 타입 정의 ====================

export interface SloResponse {
  id: string;
  userId: string;
  serviceName?: string;
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
  serviceName?: string;
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
  serviceName?: string;
  name?: string;
  metric?: 'availability' | 'latency' | 'error_rate';
  target?: number;
  sliValue?: number;
  actualDowntimeMinutes?: number;
  totalMinutes?: number;
  connectedChannels?: string[];
  description?: string;
}

// ==================== API 함수들 ====================

/**
 * POST /slos
 * 새로운 SLO 생성
 */
export const createSlo = async (data: CreateSloDto): Promise<SloResponse> => {
  return fetchWithAuth<SloResponse>('/slos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * GET /slos
 * 사용자의 모든 SLO 조회
 */
export const getSlos = async (): Promise<SloResponse[]> => {
  return fetchWithAuth<SloResponse[]>('/slos', {
    method: 'GET',
  });
};

/**
 * GET /slos/:sloId
 * 특정 SLO 조회
 */
export const getSlo = async (sloId: string): Promise<SloResponse> => {
  return fetchWithAuth<SloResponse>(`/slos/${sloId}`, {
    method: 'GET',
  });
};

/**
 * PATCH /slos/:sloId
 * SLO 업데이트
 */
export const updateSlo = async (sloId: string, data: UpdateSloDto): Promise<SloResponse> => {
  return fetchWithAuth<SloResponse>(`/slos/${sloId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE /slos/:sloId
 * SLO 삭제
 */
export const deleteSlo = async (sloId: string): Promise<void> => {
  await fetchWithAuth<void>(`/slos/${sloId}`, {
    method: 'DELETE',
  });
};
