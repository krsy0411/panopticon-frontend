/**
 * 로컬스토리지 관리 유틸리티
 */

const STORAGE_KEYS = {
  SLACK_WEBHOOK_URL: 'panopticon_slack_webhook_url',
  SLACK_ENABLED: 'panopticon_slack_enabled',
} as const;

/**
 * 슬랙 웹훅 URL 저장
 */
export function saveSlackWebhookUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SLACK_WEBHOOK_URL, url);
  localStorage.setItem(STORAGE_KEYS.SLACK_ENABLED, 'true');
}

/**
 * 슬랙 웹훅 URL 조회
 */
export function getSlackWebhookUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.SLACK_WEBHOOK_URL);
}

/**
 * 슬랙 알림 활성화 여부 확인
 */
export function isSlackEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.SLACK_ENABLED) === 'true';
}

/**
 * 슬랙 알림 활성화/비활성화
 */
export function setSlackEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SLACK_ENABLED, enabled ? 'true' : 'false');
}

/**
 * 슬랙 웹훅 설정 삭제
 */
export function clearSlackWebhook(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.SLACK_WEBHOOK_URL);
  localStorage.removeItem(STORAGE_KEYS.SLACK_ENABLED);
}
