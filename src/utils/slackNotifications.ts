/**
 * 슬랙 알림 전송 유틸리티
 *
 * 이 파일은 /app/api/notifications/route.ts와 함께 동작합니다.
 * API 파일을 삭제하면 이 함수들도 작동하지 않습니다.
 */

import { LogItem } from '@/types/apm';
import { getSlackWebhookUrl, isSlackEnabled } from './localStorage';

interface SlackNotificationPayload {
  title: string;
  message: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  serviceName?: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 슬랙으로 에러 로그 알림 전송
 */
export async function sendSlackErrorNotification(errors: LogItem[]) {
  try {
    // 로컬스토리지에서 웹훅 URL 확인
    const webhookUrl = getSlackWebhookUrl();
    const enabled = isSlackEnabled();

    if (!enabled || !webhookUrl) {
      console.log('[Slack Notification] Slack webhook not configured or disabled');
      return { success: false, reason: 'not_configured' };
    }

    // 에러 로그들을 분석하여 알림 메시지 생성
    const serviceName = errors[0]?.service_name || 'Unknown Service';
    const errorCount = errors.length;

    // 에러 메시지들 요약 (최대 3개)
    const errorMessages = errors
      .slice(0, 3)
      .map((error, index) => `${index + 1}. ${error.message}`)
      .join('\n');

    const remainingCount = errorCount > 3 ? errorCount - 3 : 0;

    const notification: SlackNotificationPayload = {
      title: `🚨 ${errorCount}개의 에러 발생`,
      message: `**Service**: ${serviceName}\n\n**최근 에러 메시지:**\n${errorMessages}${
        remainingCount > 0 ? `\n\n... 외 ${remainingCount}개 에러` : ''
      }`,
      severity: 'error',
      serviceName,
      timestamp: new Date().toISOString(),
      metadata: {
        errorCount,
        firstError: errors[0],
      },
    };

    // 로컬스토리지에서 가져온 웹훅 URL을 API에 전달하여 저장
    const saveResponse = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save',
        type: 'slack',
        config: {
          url: webhookUrl,
          enabled: true,
        },
      }),
    });

    if (!saveResponse.ok) {
      throw new Error(`Failed to save webhook: ${saveResponse.statusText}`);
    }

    // 알림 전송
    const sendResponse = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send',
        notification,
      }),
    });

    if (!sendResponse.ok) {
      throw new Error(`Failed to send notification: ${sendResponse.statusText}`);
    }

    const result = await sendResponse.json();
    console.log('[Slack Notification] Sent successfully:', result);
    return result;
  } catch (error) {
    console.error('[Slack Notification] Failed to send:', error);
    throw error;
  }
}

/**
 * 슬랙 웹훅 테스트 메시지 전송
 */
export async function testSlackWebhook(webhookUrl: string) {
  try {
    // 먼저 웹훅 URL 저장
    const saveResponse = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save',
        type: 'slack',
        config: {
          url: webhookUrl,
          enabled: true,
        },
      }),
    });

    if (!saveResponse.ok) {
      throw new Error(`Failed to save webhook: ${saveResponse.statusText}`);
    }

    // 테스트 메시지 전송
    const testResponse = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'test',
        type: 'slack',
      }),
    });

    if (!testResponse.ok) {
      throw new Error(`Failed to test webhook: ${testResponse.statusText}`);
    }

    const result = await testResponse.json();
    console.log('[Slack Webhook] Test successful:', result);
    return result;
  } catch (error) {
    console.error('[Slack Webhook] Test failed:', error);
    throw error;
  }
}
