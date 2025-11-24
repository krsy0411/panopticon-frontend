export type IntegrationType = 'discord' | 'slack' | 'teams' | 'email';

export type SloStatus = 'GOOD' | 'WARNING' | 'FAILED';

export type TimeRangeKey = '1h' | '24h' | '7d' | '30d';

export interface TimeRangeOption {
  key: TimeRangeKey;
  label: string;
  minutes: number;
  sliDelta?: number;
  downtimeMultiplier?: number;
}

export type SloMetric = 'availability' | 'latency' | 'error_rate';

export interface SloTrendPoint {
  minutesAgo: number;
  value: number;
}

export interface BaseSloRecord {
  id: string;
  name: string;
  metric: SloMetric;
  target: number;
  sliValue: number;
  totalMinutes: number;
  actualDowntimeMinutes: number;
  tooltipTitle: string;
  tooltipDescription: string;
  connectedChannels: IntegrationType[];
  trend: SloTrendPoint[];
}

export interface ComputedSlo extends BaseSloRecord {
  status: SloStatus;
  allowedDowntimeMinutes: number;
  errorBudgetUsedRate: number;
  errorBudgetRemainingPct: number;
  errorBudgetOverPct: number;
  description?: string;
}

export interface IntegrationStatus {
  type: IntegrationType;
  connected: boolean;
  connectedSloCount: number;
  lastTestResult: 'success' | 'failure' | null;
  lastTestAt?: Date | string;
  errorMessage?: string;
}

export interface NotificationSummary {
  overallStatus: SloStatus;
  problemCount: number;
  availability24h: number;
  errorBudgetTotalOverPct: number;
  lastAlert: string;
}

export interface SloCreateInput {
  id: string;
  name: string;
  description?: string;
  metric: SloMetric;
  target: number;
  sliValue: number;
  totalMinutes?: number;
  actualDowntimeMinutes: number;
  tooltipTitle: string;
  tooltipDescription: string;
  connectedChannels: IntegrationType[];
  timeRangeKey?: TimeRangeKey;
}
