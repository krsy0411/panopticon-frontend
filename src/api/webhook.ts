/**
 * Webhook API 호출 함수들
 * panopticon_authserver와 통신하여 webhook 설정을 관리합니다.
 * 쿠키 기반 인증(httpOnly auth-token cookie)을 사용합니다.
 */

import { IntegrationType } from '@/src/types/notification';

// ==================== 타입 정의 ====================

export interface WebhookConfig {
  id: string;
  userId: string;
  type: IntegrationType;
  name: string;
  webhookUrl: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastTestedAt?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpTls?: boolean;
}

export interface CreateWebhookDto {
  type: IntegrationType;
  name: string;
  webhookUrl: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpTls?: boolean;
}

export interface UpdateWebhookDto {
  type?: IntegrationType;
  name?: string;
  webhookUrl?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpTls?: boolean;
}

export interface TestWebhookResponse {
  success: boolean;
  message: string;
}

// ==================== API Base URL ====================

const getAuthServerUrl = (): string => {
  return process.env.NEXT_PUBLIC_AUTH_SERVER_URL || 'http://localhost:8080';
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

  return response.json() as Promise<T>;
}

// ==================== API 함수들 ====================

/**
 * POST /auth/webhooks
 * 새로운 webhook 설정 생성
 */
export const createWebhook = async (data: CreateWebhookDto): Promise<WebhookConfig> => {
  return fetchWithAuth<WebhookConfig>('/auth/webhooks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * GET /auth/webhooks
 * 사용자의 모든 webhook 설정 조회
 */
export const getWebhooks = async (): Promise<WebhookConfig[]> => {
  return fetchWithAuth<WebhookConfig[]>('/auth/webhooks', {
    method: 'GET',
  });
};

/**
 * GET /auth/webhooks/:webhookId
 * 특정 webhook 설정 조회
 */
export const getWebhook = async (webhookId: string): Promise<WebhookConfig> => {
  return fetchWithAuth<WebhookConfig>(`/auth/webhooks/${webhookId}`, {
    method: 'GET',
  });
};

/**
 * PATCH /auth/webhooks/:webhookId
 * webhook 설정 업데이트
 */
export const updateWebhook = async (
  webhookId: string,
  data: UpdateWebhookDto,
): Promise<WebhookConfig> => {
  return fetchWithAuth<WebhookConfig>(`/auth/webhooks/${webhookId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE /auth/webhooks/:webhookId
 * webhook 설정 삭제
 */
export const deleteWebhook = async (webhookId: string): Promise<void> => {
  await fetchWithAuth<void>(`/auth/webhooks/${webhookId}`, {
    method: 'DELETE',
  });
};

/**
 * PATCH /auth/webhooks/:webhookId/toggle
 * webhook 활성화/비활성화 토글
 */
export const toggleWebhookEnabled = async (webhookId: string): Promise<WebhookConfig> => {
  return fetchWithAuth<WebhookConfig>(`/auth/webhooks/${webhookId}/toggle`, {
    method: 'PATCH',
  });
};

/**
 * POST /auth/webhooks/:webhookId/test
 * webhook 테스트 메시지 발송
 */
export const testWebhook = async (webhookId: string): Promise<TestWebhookResponse> => {
  return fetchWithAuth<TestWebhookResponse>(`/auth/webhooks/${webhookId}/test`, {
    method: 'POST',
  });
};
