/**
 * TimeRange 타입을 start_time과 end_time으로 변환하는 유틸리티
 */

export type TimeRange = '1h' | '3h' | '6h' | '12h' | '1d' | '1w' | '2w' | '1M';

export interface TimeRangeParams {
  start_time: string;
  end_time: string;
}

/**
 * 상대 시간(TimeRange)을 절대 시간(start_time, end_time)으로 변환
 * @param timeRange - 상대 시간 값 (예: "1h", "1d")
 * @returns start_time과 end_time (ISO 8601 형식)
 */
export function convertTimeRangeToParams(timeRange: TimeRange): TimeRangeParams {
  const now = new Date();
  const endTime = now.toISOString();

  // 시간 차이 계산 (밀리초)
  const timeRangeMap: Record<TimeRange, number> = {
    '1h': 1 * 60 * 60 * 1000,
    '3h': 3 * 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '12h': 12 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
    '2w': 14 * 24 * 60 * 60 * 1000,
    '1M': 30 * 24 * 60 * 60 * 1000,
  };

  const diffMs = timeRangeMap[timeRange];
  const startTime = new Date(now.getTime() - diffMs).toISOString();

  return {
    start_time: startTime,
    end_time: endTime,
  };
}

/**
 * 시간 범위에 따라 적절한 interval 값을 계산
 * @param timeRange - 상대 시간 값
 * @returns interval 값 (예: "1m", "5m", "10m", "1h")
 */
export function getIntervalForTimeRange(timeRange: TimeRange): string {
  const intervalMap: Record<TimeRange, string> = {
    '1h': '1m',
    '3h': '1m',
    '6h': '5m',
    '12h': '5m',
    '1d': '10m',
    '1w': '1h',
    '2w': '1h',
    '1M': '1h',
  };

  return intervalMap[timeRange];
}
