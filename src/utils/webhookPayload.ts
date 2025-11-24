/**
 * 웹훅 채널별 메시지 포맷 생성 유틸리티
 */

import type { SloMetric } from '@/src/types/notification';

export interface WebhookPayload {
  webhookUrl: string;
  payload: Record<string, unknown>;
}

/**
 * SLO 정보를 기반으로 Slack 메시지 생성
 */
export function createSlackPayload(
  sloName: string,
  metric: SloMetric,
  target: number,
  currentValue: number,
): Record<string, unknown> {
  const metricLabel = formatMetricForDisplay(metric, currentValue, target);
  const color = '#ff0000'; // Red for alert

  return {
    text: `⚠️ SLO 위반 경고`,
    attachments: [
      {
        color,
        title: `SLO: ${sloName}`,
        fields: [
          {
            title: '메트릭',
            value: getMetricName(metric),
            short: true,
          },
          {
            title: '목표값',
            value: formatMetricTarget(metric, target),
            short: true,
          },
          {
            title: '현재값',
            value: metricLabel,
            short: true,
          },
          {
            title: '상태',
            value: '⛔ FAILED',
            short: true,
          },
        ],
        footer: 'Panopticon SLO Monitoring',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };
}

/**
 * SLO 정보를 기반으로 Discord 메시지 생성
 */
export function createDiscordPayload(
  sloName: string,
  metric: SloMetric,
  target: number,
  currentValue: number,
): Record<string, unknown> {
  const metricLabel = formatMetricForDisplay(metric, currentValue, target);

  return {
    content: `⚠️ **SLO 위반**: ${sloName}`,
    embeds: [
      {
        title: sloName,
        color: 15158332, // Red (#ff0000)
        fields: [
          {
            name: '메트릭',
            value: getMetricName(metric),
            inline: true,
          },
          {
            name: '목표값',
            value: formatMetricTarget(metric, target),
            inline: true,
          },
          {
            name: '현재값',
            value: metricLabel,
            inline: false,
          },
          {
            name: '상태',
            value: '⛔ FAILED',
            inline: true,
          },
        ],
        footer: {
          text: 'Panopticon SLO Monitoring',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

/**
 * Teams용 메시지 (MessageCard 형식)
 */
export function createTeamsPayload(
  sloName: string,
  metric: SloMetric,
  target: number,
  currentValue: number,
): Record<string, unknown> {
  const metricLabel = formatMetricForDisplay(metric, currentValue, target);

  return {
    '@type': 'MessageCard',
    '@context': 'https://schema.org/extensions',
    summary: `SLO 위반: ${sloName}`,
    themeColor: 'ff0000',
    sections: [
      {
        activityTitle: `⚠️ SLO 위반: ${sloName}`,
        facts: [
          {
            name: '메트릭',
            value: getMetricName(metric),
          },
          {
            name: '목표값',
            value: formatMetricTarget(metric, target),
          },
          {
            name: '현재값',
            value: metricLabel,
          },
          {
            name: '상태',
            value: '⛔ FAILED',
          },
        ],
        markdown: true,
      },
      {
        activitySubtitle: `발생 시간: ${new Date().toLocaleString('ko-KR')}`,
      },
    ],
  };
}

/**
 * 메트릭 표시명 반환
 */
function getMetricName(metric: SloMetric): string {
  const names: Record<SloMetric, string> = {
    latency: 'Latency (p95)',
    error_rate: 'Error Rate',
    availability: 'Availability',
  };
  return names[metric] || metric;
}

/**
 * 메트릭 값을 포맷팅된 문자열로 반환
 */
function formatMetricForDisplay(metric: SloMetric, currentValue: number, target: number): string {
  switch (metric) {
    case 'latency':
      return `${currentValue.toFixed(0)}ms (목표: ${target}ms 이하)`;
    case 'error_rate':
      return `${(currentValue * 100).toFixed(2)}% (목표: ${(target * 100).toFixed(2)}% 이하)`;
    case 'availability':
      return `${((1 - currentValue) * 100).toFixed(2)}% (목표: ${(target * 100).toFixed(2)}% 이상)`;
    default:
      return currentValue.toFixed(2);
  }
}

/**
 * 메트릭 목표값 포맷팅
 */
function formatMetricTarget(metric: SloMetric, target: number): string {
  switch (metric) {
    case 'latency':
      return `${target}ms 이하`;
    case 'error_rate':
      return `${(target * 100).toFixed(2)}% 이하`;
    case 'availability':
      return `${(target * 100).toFixed(2)}% 이상`;
    default:
      return target.toFixed(2);
  }
}
