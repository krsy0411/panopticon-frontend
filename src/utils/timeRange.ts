/**
 * TimeRange 타입을 start_time과 end_time으로 변환하는 유틸리티
 */

export type TimeRange =
  | '15min'
  | '30min'
  | '45min'
  | '1h'
  | '3h'
  | '6h'
  | '9h'
  | '12h'
  | '1d'
  | '1w'
  | '2w'
  | '3w'
  | '1M';

export interface TimeRangeParams {
  start_time: string;
  end_time: string;
}

/**
 * 시간 범위를 밀리초로 변환하는 맵
 */
export const TIME_RANGE_DURATION_MS: Record<TimeRange, number> = {
  '15min': 15 * 60 * 1000,
  '30min': 30 * 60 * 1000,
  '45min': 45 * 60 * 1000,
  '1h': 1 * 60 * 60 * 1000,
  '3h': 3 * 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '9h': 9 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
  '2w': 14 * 24 * 60 * 60 * 1000,
  '3w': 21 * 24 * 60 * 60 * 1000,
  '1M': 30 * 24 * 60 * 60 * 1000,
};

/**
 * 상대 시간(TimeRange)을 절대 시간(start_time, end_time)으로 변환
 * @param timeRange - 상대 시간 값 (예: "15min", "1h", "1d")
 * @returns start_time과 end_time (ISO 8601 형식)
 */
export function convertTimeRangeToParams(timeRange: TimeRange): TimeRangeParams {
  const now = new Date();
  const diffMs = TIME_RANGE_DURATION_MS[timeRange];
  const startTime = new Date(now.getTime() - diffMs);

  return {
    start_time: startTime.toISOString(),
    end_time: now.toISOString(),
  };
}

/**
 * 시간 범위에 따라 적절한 interval 값을 계산
 * @param timeRange - 상대 시간 값
 * @returns interval 값 (예: "1m", "5m", "10m", "1h")
 */
export function getIntervalForTimeRange(timeRange: TimeRange): string {
  const intervalMap: Record<TimeRange, string> = {
    '15min': '20s', // 15분 → 20초 간격 (45개 포인트)
    '30min': '30s', // 30분 → 30초 간격 (60개 포인트)
    '45min': '45s', // 45분 → 45초 간격 (60개 포인트)
    '1h': '1m', // 1시간 → 1분 간격 (60개 포인트)
    '3h': '3m', // 3시간 → 3분 간격 (60개 포인트)
    '6h': '7m', // 6시간 → 7분 간격 (51개 포인트)
    '9h': '9m', // 9시간 → 9분 간격 (60개 포인트)
    '12h': '12m', // 12시간 → 12분 간격 (60개 포인트)
    '1d': '25m', // 1일 → 25분 간격 (57개 포인트)
    '1w': '2h', // 1주 → 2시간 간격 (약 70개 포인트)
    '2w': '3h', // 2주 → 3시간 간격 (약 56개 포인트)
    '3w': '4h', // 3주 → 4시간 간격 (약 42개 포인트)
    '1M': '12h', // 1개월 → 12시간 간격 (60개 포인트)
  };

  return intervalMap[timeRange];
}

/**
 * 차트 X축 범위를 현재 시각 기준으로 계산
 * 항상 현재 시각을 최댓값으로 하고, timeRange만큼 이전을 최솟값으로 설정
 *
 * @param timeRange - 상대 시간 값 (예: "15min", "1h", "1d")
 * @returns X축 범위 { min: 밀리초, max: 밀리초 }
 */
export function getChartXAxisRange(timeRange: TimeRange): { min: number; max: number } {
  const now = new Date().getTime();
  const duration = TIME_RANGE_DURATION_MS[timeRange];

  return {
    min: now - duration,
    max: now,
  };
}
