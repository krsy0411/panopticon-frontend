/**
 * Webhook API 호출 함수들
 * panopticon_authserver와 통신하여 webhook 설정을 관리합니다.
 * 쿠키 기반 인증(httpOnly auth-token cookie)을 사용합니다.
 */

import { IntegrationType } from '@/src/types/notification';
import { fetchWithAuth } from './auth';

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

// ==================== API 함수들 ====================

/**
 * POST /webhooks
 * 새로운 webhook 설정 생성
 */
export const createWebhook = async (data: CreateWebhookDto): Promise<WebhookConfig> => {
  return fetchWithAuth<WebhookConfig>('/webhooks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * GET /webhooks
 * 사용자의 모든 webhook 설정 조회
 */
export const getWebhooks = async (): Promise<WebhookConfig[]> => {
  return fetchWithAuth<WebhookConfig[]>('/webhooks', {
    method: 'GET',
  });
};

/**
 * GET /webhooks/:webhookId
 * 특정 webhook 설정 조회
 */
export const getWebhook = async (webhookId: string): Promise<WebhookConfig> => {
  return fetchWithAuth<WebhookConfig>(`/webhooks/${webhookId}`, {
    method: 'GET',
  });
};

/**
 * PATCH /webhooks/:webhookId
 * webhook 설정 업데이트
 */
export const updateWebhook = async (
  webhookId: string,
  data: UpdateWebhookDto,
): Promise<WebhookConfig> => {
  return fetchWithAuth<WebhookConfig>(`/webhooks/${webhookId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE /webhooks/:webhookId
 * webhook 설정 삭제
 */
export const deleteWebhook = async (webhookId: string): Promise<void> => {
  await fetchWithAuth<void>(`/webhooks/${webhookId}`, {
    method: 'DELETE',
  });
};

/**
 * PATCH /webhooks/:webhookId/toggle
 * webhook 활성화/비활성화 토글
 */
export const toggleWebhookEnabled = async (webhookId: string): Promise<WebhookConfig> => {
  return fetchWithAuth<WebhookConfig>(`/webhooks/${webhookId}/toggle`, {
    method: 'PATCH',
  });
};

/**
 * POST /webhooks/:webhookId/test
 * webhook 테스트 메시지 발송
 */
export const testWebhook = async (webhookId: string): Promise<TestWebhookResponse> => {
  return fetchWithAuth<TestWebhookResponse>(`/webhooks/${webhookId}/test`, {
    method: 'POST',
  });
};
