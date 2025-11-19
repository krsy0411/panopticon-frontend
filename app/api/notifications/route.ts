/**
 * 알림 통합 API (시연용 임시 구현)
 *
 * 이 파일 하나만 삭제하면 알림 기능이 완전히 제거됩니다.
 * 프로덕션에서는 Lambda + DynamoDB로 대체될 예정입니다.
 *
 * 지원하는 플랫폼:
 * - Discord
 * - Slack
 * - Microsoft Teams
 * - Email (SMTP)
 * - Jira
 * - GitHub
 * - Trello
 */

import { NextRequest, NextResponse } from 'next/server';

// ==================== 타입 정의 ====================

type NotificationType = 'discord' | 'slack' | 'teams' | 'email' | 'jira' | 'github' | 'trello';

interface WebhookConfig {
  type: NotificationType;
  url: string;
  enabled: boolean;
  // Email 전용
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  recipients?: string[];
}

interface NotificationMessage {
  title: string;
  message: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  serviceName?: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

// ==================== 인메모리 저장소 (시연용) ====================
// 실제 프로덕션에서는 DynamoDB로 대체
const webhookStore = new Map<string, WebhookConfig>();

// ==================== Discord 메시지 전송 ====================
async function sendDiscordMessage(config: WebhookConfig, notification: NotificationMessage) {
  const color = {
    info: 0x3b82f6, // blue
    warning: 0xf59e0b, // amber
    error: 0xef4444, // red
    critical: 0xdc2626, // dark red
  }[notification.severity || 'info'];

  const payload = {
    embeds: [
      {
        title: notification.title,
        description: notification.message,
        color,
        fields: [
          ...(notification.serviceName
            ? [{ name: 'Service', value: notification.serviceName, inline: true }]
            : []),
          ...(notification.severity
            ? [{ name: 'Severity', value: notification.severity.toUpperCase(), inline: true }]
            : []),
        ],
        timestamp: notification.timestamp || new Date().toISOString(),
        footer: {
          text: 'Panopticon APM',
        },
      },
    ],
  };

  const response = await fetch(config.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.statusText}`);
  }

  return { success: true, platform: 'discord' };
}

// ==================== Slack 메시지 전송 ====================
async function sendSlackMessage(config: WebhookConfig, notification: NotificationMessage) {
  const color = {
    info: '#3b82f6',
    warning: '#f59e0b',
    error: '#ef4444',
    critical: '#dc2626',
  }[notification.severity || 'info'];

  const payload = {
    attachments: [
      {
        color,
        title: notification.title,
        text: notification.message,
        fields: [
          ...(notification.serviceName
            ? [{ title: 'Service', value: notification.serviceName, short: true }]
            : []),
          ...(notification.severity
            ? [{ title: 'Severity', value: notification.severity.toUpperCase(), short: true }]
            : []),
        ],
        footer: 'Panopticon APM',
        ts: Math.floor(new Date(notification.timestamp || Date.now()).getTime() / 1000),
      },
    ],
  };

  const response = await fetch(config.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook failed: ${response.statusText}`);
  }

  return { success: true, platform: 'slack' };
}

// ==================== Microsoft Teams 메시지 전송 ====================
async function sendTeamsMessage(config: WebhookConfig, notification: NotificationMessage) {
  const color = {
    info: '0078D4',
    warning: 'FFB900',
    error: 'D13438',
    critical: 'A4262C',
  }[notification.severity || 'info'];

  const payload = {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    themeColor: color,
    summary: notification.title,
    sections: [
      {
        activityTitle: notification.title,
        activitySubtitle: notification.serviceName || 'Panopticon APM',
        facts: [
          ...(notification.severity
            ? [{ name: 'Severity', value: notification.severity.toUpperCase() }]
            : []),
          ...(notification.timestamp
            ? [{ name: 'Time', value: new Date(notification.timestamp).toLocaleString() }]
            : []),
        ],
        text: notification.message,
      },
    ],
  };

  const response = await fetch(config.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Teams webhook failed: ${response.statusText}`);
  }

  return { success: true, platform: 'teams' };
}

// ==================== Email 전송 (간단한 구현) ====================
async function sendEmail(config: WebhookConfig, notification: NotificationMessage) {
  // 실제로는 nodemailer 등을 사용해야 하지만, 시연용으로는 로깅만
  console.log('[Email] Would send email:', {
    to: config.recipients,
    subject: notification.title,
    body: notification.message,
    smtp: {
      host: config.smtpHost,
      port: config.smtpPort,
      user: config.smtpUser,
    },
  });

  // 시연용: 성공으로 간주
  return { success: true, platform: 'email', note: 'Email sending is mocked in demo' };
}

// ==================== Jira 이슈 생성 ====================
async function sendJiraNotification(config: WebhookConfig, notification: NotificationMessage) {
  // Jira REST API는 인증이 필요하므로 시연용으로는 로깅만
  console.log('[Jira] Would create issue:', {
    url: config.url,
    summary: notification.title,
    description: notification.message,
    severity: notification.severity,
  });

  return { success: true, platform: 'jira', note: 'Jira integration is mocked in demo' };
}

// ==================== GitHub 이슈 생성 ====================
async function sendGitHubNotification(config: WebhookConfig, notification: NotificationMessage) {
  // GitHub API는 인증이 필요하므로 시연용으로는 로깅만
  console.log('[GitHub] Would create issue:', {
    url: config.url,
    title: notification.title,
    body: notification.message,
    labels: [notification.severity || 'info'],
  });

  return { success: true, platform: 'github', note: 'GitHub integration is mocked in demo' };
}

// ==================== Trello 카드 생성 ====================
async function sendTrelloNotification(config: WebhookConfig, notification: NotificationMessage) {
  // Trello API는 인증이 필요하므로 시연용으로는 로깅만
  console.log('[Trello] Would create card:', {
    url: config.url,
    name: notification.title,
    desc: notification.message,
  });

  return { success: true, platform: 'trello', note: 'Trello integration is mocked in demo' };
}

// ==================== 통합 메시지 전송 함수 ====================
async function sendNotification(config: WebhookConfig, notification: NotificationMessage) {
  if (!config.enabled) {
    return { success: false, error: 'Webhook is disabled' };
  }

  try {
    switch (config.type) {
      case 'discord':
        return await sendDiscordMessage(config, notification);
      case 'slack':
        return await sendSlackMessage(config, notification);
      case 'teams':
        return await sendTeamsMessage(config, notification);
      case 'email':
        return await sendEmail(config, notification);
      case 'jira':
        return await sendJiraNotification(config, notification);
      case 'github':
        return await sendGitHubNotification(config, notification);
      case 'trello':
        return await sendTrelloNotification(config, notification);
      default:
        throw new Error(`Unsupported notification type: ${config.type}`);
    }
  } catch (error) {
    console.error(`[${config.type}] Send failed:`, error);
    return {
      success: false,
      platform: config.type,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==================== API 핸들러 ====================

/**
 * GET /api/notifications
 * 모든 웹훅 설정 조회
 */
export async function GET() {
  const configs = Array.from(webhookStore.values());
  return NextResponse.json({ configs });
}

/**
 * POST /api/notifications
 *
 * 요청 본문:
 * - action: 'save' | 'send' | 'test' | 'delete'
 * - type: NotificationType (save/delete/test 시 필수)
 * - config: WebhookConfig (save 시 필수)
 * - notification: NotificationMessage (send/test 시 필수)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, type, config, notification } = body;

    // ========== 웹훅 설정 저장 ==========
    if (action === 'save') {
      if (!type || !config) {
        return NextResponse.json({ error: 'Missing type or config' }, { status: 400 });
      }

      const webhookConfig: WebhookConfig = {
        type,
        url: config.url,
        enabled: config.enabled !== false,
        ...config,
      };

      webhookStore.set(type, webhookConfig);

      return NextResponse.json({
        success: true,
        message: `${type} webhook saved`,
        config: webhookConfig,
      });
    }

    // ========== 웹훅 설정 삭제 ==========
    if (action === 'delete') {
      if (!type) {
        return NextResponse.json({ error: 'Missing type' }, { status: 400 });
      }

      webhookStore.delete(type);

      return NextResponse.json({
        success: true,
        message: `${type} webhook deleted`,
      });
    }

    // ========== 테스트 메시지 전송 ==========
    if (action === 'test') {
      if (!type) {
        return NextResponse.json({ error: 'Missing type' }, { status: 400 });
      }

      const webhookConfig = webhookStore.get(type);
      if (!webhookConfig) {
        return NextResponse.json({ error: `No webhook config found for ${type}` }, { status: 404 });
      }

      const testNotification: NotificationMessage = {
        title: '🔔 Test Notification',
        message: 'This is a test message from Panopticon APM',
        severity: 'info',
        serviceName: 'test-service',
        timestamp: new Date().toISOString(),
      };

      const result = await sendNotification(webhookConfig, testNotification);

      return NextResponse.json(result);
    }

    // ========== 실제 알림 전송 ==========
    if (action === 'send') {
      if (!notification) {
        return NextResponse.json({ error: 'Missing notification' }, { status: 400 });
      }

      // 활성화된 모든 웹훅으로 전송
      const activeConfigs = Array.from(webhookStore.values()).filter((c) => c.enabled);

      if (activeConfigs.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'No active webhooks configured',
        });
      }

      const results = await Promise.allSettled(
        activeConfigs.map((config) => sendNotification(config, notification)),
      );

      const responses = results.map((result, index) => {
        const platform = activeConfigs[index].type;

        if (result.status === 'fulfilled') {
          // result.value may include a `platform` property; avoid duplicating the key
          const valueObj = result.value as Record<string, unknown>;
          const rest = { ...valueObj };
          if ('platform' in rest) delete (rest as Record<string, unknown>)['platform'];
          return { platform, ...rest };
        }

        return { platform, success: false, error: result.reason };
      });

      return NextResponse.json({
        success: true,
        results: responses,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Must be: save, send, test, or delete' },
      { status: 400 },
    );
  } catch (error) {
    console.error('[Notifications API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/notifications?type={type}
 * 특정 웹훅 설정 삭제
 */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as NotificationType | null;

  if (!type) {
    return NextResponse.json({ error: 'Missing type parameter' }, { status: 400 });
  }

  const existed = webhookStore.has(type);
  webhookStore.delete(type);

  return NextResponse.json({
    success: true,
    message: existed ? `${type} webhook deleted` : `${type} webhook was not configured`,
  });
}
