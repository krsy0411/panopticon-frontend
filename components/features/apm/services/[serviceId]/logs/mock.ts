// 더미 데이터

import { LogEntry, StatItem } from '@/types/apm';

/*상단 카드용 더미 통계*/
export const mockStats: StatItem[] = [
  { id: 'total', label: '총 로그', value: 5, tone: 'neutral' },
  { id: 'error', label: '에러', value: 2, tone: 'danger' },
  { id: 'warn', label: '경고', value: 2, tone: 'warning' },
  { id: 'info', label: '정보', value: 1, tone: 'info' },
];

/*더미 로그 4개*/
export const mockLogs: LogEntry[] = [
  {
    id: '1',
    level: 'ERROR',
    service: 'payment-api',
    traceId: 'trace-abc123',
    message: 'Database connection timeout',
    timestamp: '2025-10-28 14:32:45.123',
  },
  {
    id: '2',
    level: 'ERROR',
    service: 'auth-service',
    traceId: 'trace-def456',
    message: 'High latency detected on /api/login endpoint',
    timestamp: '2025-10-28 14:32:12.456',
  },
  {
    id: '3',
    level: 'ERROR',
    service: 'payment-api',
    traceId: 'trace-ghi789',
    message: 'Payment processing failed',
    timestamp: '2025-10-28 14:31:55.789',
  },
  {
    id: '4',
    level: 'ERROR',
    service: 'user-service',
    traceId: 'trace-jkl012',
    message: 'User successfully logged in',
    timestamp: '2025-10-28 14:31:20.012',
  },
];
