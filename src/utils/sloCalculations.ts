/**
 * SLO 모니터링 관련 유틸리티 함수들
 * - SLI 값 계산
 * - 메트릭 값을 SLI로 변환
 * - 상태 판정
 */

import type { SloMetric } from '@/src/types/notification';

/**
 * 메트릭 값을 SLI(0~1 범위)로 변환
 *
 * - latency: 측정값과 target의 비율 (target / metricValue)
 * - error_rate: 1 - errorRate (이미 0~1 범위)
 * - availability: 1 - errorRate와 동일
 */
export function calculateSliFromMetric(
  metric: SloMetric,
  metricValue: number,
  target: number,
): number {
  switch (metric) {
    case 'latency':
      // latency: metricValue / target 비율 (실제값 / 목표값)
      // 예: target=200ms, 측정값=150ms → 150/200 = 0.75 (75% 달성)
      // 예: target=200ms, 측정값=250ms → 250/200 = 1.25 (125%, 목표 초과)
      return Math.max(metricValue, 0) / Math.max(target, 1);

    case 'error_rate':
      // error_rate는 이미 0~1 범위
      // availability = 1 - error_rate
      return Math.max(0, 1 - metricValue);

    case 'availability':
      // availability도 1 - error_rate로 계산
      return Math.max(0, 1 - metricValue);

    default:
      return 0;
  }
}

/**
 * SLI 값 기반으로 상태 판정
 * - sliValue >= target: GOOD (에러 허용치 내)
 * - 0.5 * target <= sliValue < target: WARNING (주의 필요)
 * - sliValue < 0.5 * target: FAILED (치명적)
 */
export function deriveSloStatus(sliValue: number, target: number) {
  if (sliValue >= target) return 'GOOD' as const;
  if (sliValue >= 0.5 * target) return 'WARNING' as const;
  return 'FAILED' as const;
}

/**
 * 에러 예산 기반 상태 판정 (기존 로직)
 * - GOOD: 허용치 사용률 50% 이하
 * - WARNING: 허용치 사용률 50~90%
 * - FAILED: 허용치 사용률 90% 초과
 */
export function deriveStatusFromErrorBudget(errorBudgetUsedRate: number) {
  const usedPercent = errorBudgetUsedRate * 100;
  if (usedPercent <= 50) return 'GOOD' as const;
  if (usedPercent <= 90) return 'WARNING' as const;
  return 'FAILED' as const;
}

/**
 * 메트릭 타입별 포맷팅 함수
 */
export function formatMetricValue(metric: SloMetric, value: number): string {
  switch (metric) {
    case 'latency':
      return `${Math.round(value)}ms`;
    case 'error_rate':
      return `${(value * 100).toFixed(2)}%`;
    case 'availability':
      return `${(value * 100).toFixed(2)}%`;
    default:
      return `${value.toFixed(2)}`;
  }
}
