import { useMemo, useState } from 'react';
import type {
  BaseSloRecord,
  ComputedSlo,
  IntegrationStatus,
  IntegrationType,
  NotificationSummary,
  SloStatus,
  SloTrendPoint,
  TimeRangeKey,
  TimeRangeOption,
} from '../types/notification';

export const TIME_RANGES: TimeRangeOption[] = [
  { key: '1h', label: '최근 1시간', minutes: 60, sliDelta: 0.001, downtimeMultiplier: 1 / 24 },
  { key: '24h', label: '24시간', minutes: 60 * 24 },
  { key: '7d', label: '7일', minutes: 60 * 24 * 7, sliDelta: -0.002, downtimeMultiplier: 7 },
  { key: '30d', label: '30일', minutes: 60 * 24 * 30, sliDelta: -0.004, downtimeMultiplier: 30 },
];

const baseSloRecords: BaseSloRecord[] = [
  {
    id: 'slo-availability',
    name: 'Availability',
    metric: 'availability',
    target: 0.999,
    sliValue: 0.992,
    totalMinutes: 60 * 24,
    actualDowntimeMinutes: 6,
    tooltipTitle: 'Availability SLO',
    tooltipDescription: '비정상 응답 없이 처리된 요청의 비율입니다. 허용치 계산에 사용됩니다.',
    connectedChannels: ['slack', 'email'],
    trend: [
      { minutesAgo: 30, value: 0.995 },
      { minutesAgo: 120, value: 0.993 },
      { minutesAgo: 240, value: 0.992 },
      { minutesAgo: 480, value: 0.991 },
      { minutesAgo: 1440, value: 0.992 },
      { minutesAgo: 10080, value: 0.99 },
      { minutesAgo: 20160, value: 0.989 },
      { minutesAgo: 43200, value: 0.987 },
    ],
  },
  {
    id: 'slo-latency',
    name: 'Latency (P95)',
    metric: 'latency',
    target: 0.97,
    sliValue: 0.963,
    totalMinutes: 60 * 24,
    actualDowntimeMinutes: 35,
    tooltipTitle: 'Latency P95',
    tooltipDescription: '전체 요청 중 가장 느린 5%를 제외한 응답 시간입니다.',
    connectedChannels: ['slack'],
    trend: [
      { minutesAgo: 30, value: 0.971 },
      { minutesAgo: 120, value: 0.968 },
      { minutesAgo: 240, value: 0.964 },
      { minutesAgo: 480, value: 0.962 },
      { minutesAgo: 1440, value: 0.963 },
      { minutesAgo: 10080, value: 0.958 },
      { minutesAgo: 20160, value: 0.955 },
      { minutesAgo: 43200, value: 0.952 },
    ],
  },
  {
    id: 'slo-error',
    name: 'Error Rate',
    metric: 'error_rate',
    target: 0.985,
    sliValue: 0.978,
    totalMinutes: 60 * 24,
    actualDowntimeMinutes: 30,
    tooltipTitle: 'Error Rate',
    tooltipDescription: '전체 요청 중 오류가 발생한 비율입니다.',
    connectedChannels: ['email', 'teams'],
    trend: [
      { minutesAgo: 30, value: 0.981 },
      { minutesAgo: 120, value: 0.979 },
      { minutesAgo: 240, value: 0.977 },
      { minutesAgo: 480, value: 0.975 },
      { minutesAgo: 1440, value: 0.976 },
      { minutesAgo: 10080, value: 0.972 },
      { minutesAgo: 20160, value: 0.969 },
      { minutesAgo: 43200, value: 0.965 },
    ],
  },
];

const integrationDefaults: IntegrationStatus[] = [
  {
    type: 'slack',
    connected: true,
    connectedSloCount: 0,
    lastTestResult: 'success',
    lastTestAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    type: 'email',
    connected: true,
    connectedSloCount: 0,
    lastTestResult: 'failure',
    lastTestAt: new Date(Date.now() - 20 * 60 * 1000),
    errorMessage: 'SMTP 400 응답',
  },
  {
    type: 'teams',
    connected: false,
    connectedSloCount: 0,
    lastTestResult: null,
  },
  {
    type: 'discord',
    connected: false,
    connectedSloCount: 0,
    lastTestResult: null,
  },
];

const deriveStatus = (usedRate: number): SloStatus => {
  const usedPercent = usedRate * 100;
  if (usedPercent < 70) return 'GOOD';
  if (usedPercent < 100) return 'WARNING';
  return 'FAILED';
};

export function useNotificationMock() {
  const [timeRange, setTimeRange] = useState<TimeRangeKey>('24h');

  const range = useMemo(
    () => TIME_RANGES.find((option) => option.key === timeRange) ?? TIME_RANGES[1],
    [timeRange],
  );

  const sloList: ComputedSlo[] = useMemo(() => {
    const downtimeMultiplier = range.downtimeMultiplier ?? range.minutes / (60 * 24);
    const sliDelta = range.sliDelta ?? 0;

    return baseSloRecords.map((record) => {
      const adjustedSli = Math.min(0.999, Math.max(0, record.sliValue + sliDelta));
      const totalMinutes = record.totalMinutes * downtimeMultiplier;
      const actualDowntime = record.actualDowntimeMinutes * downtimeMultiplier;
      const errorBudget = 1 - adjustedSli;
      const allowedDowntime = totalMinutes * errorBudget;
      const usedRate = allowedDowntime === 0 ? 0 : actualDowntime / allowedDowntime;

      return {
        ...record,
        sliValue: adjustedSli,
        totalMinutes,
        actualDowntimeMinutes: actualDowntime,
        allowedDowntimeMinutes: allowedDowntime,
        errorBudgetUsedRate: usedRate,
        errorBudgetRemainingPct: Math.max(0, (1 - usedRate) * 100),
        errorBudgetOverPct: Math.max(0, usedRate * 100 - 100),
        status: deriveStatus(usedRate),
        trend: record.trend.filter((point) => point.minutesAgo <= range.minutes),
      };
    });
  }, [range]);

  const integrationStatuses: IntegrationStatus[] = useMemo(() => {
    return integrationDefaults.map((integration) => ({
      ...integration,
      connectedSloCount: sloList.filter((slo) => slo.connectedChannels.includes(integration.type))
        .length,
    }));
  }, [sloList]);

  const summary: NotificationSummary = useMemo(() => {
    const sorted = sloList
      .map((slo) => slo.status)
      .sort((a, b) => {
        const weight: Record<SloStatus, number> = { GOOD: 0, WARNING: 1, FAILED: 2 };
        return weight[b] - weight[a];
      });

    const overallStatus = sorted[0] ?? 'GOOD';
    const availability = sloList.find((slo) => slo.metric === 'availability');
    const availability24h = (availability?.sliValue ?? 1) * 100;
    const errorBudgetTotalOverPct = sloList.reduce((acc, slo) => acc + slo.errorBudgetOverPct, 0);

    return {
      overallStatus,
      problemCount: sloList.filter((slo) => slo.status !== 'GOOD').length,
      availability24h,
      errorBudgetTotalOverPct,
      lastAlert: 'Slack 알림 1건 · 5분 전',
    };
  }, [sloList]);

  return {
    timeRange,
    setTimeRange,
    timeRangeOptions: TIME_RANGES,
    sloList,
    integrationStatuses,
    summary,
  };
}
