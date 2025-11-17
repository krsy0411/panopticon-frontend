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
  | '12h'
  | '1d'
  | '1w'
  | '2w'
  | '1M';

export interface TimeRangeParams {
  start_time: string;
  end_time: string;
}

/**
 * 시간을 interval에 맞게 정렬 (올림)
 * @param date - 정렬할 Date 객체
 * @param interval - 정렬 기준 interval (예: "1m", "5m", "1h", "1d")
 * @returns 정렬된 Date 객체
 */
function alignTimeToInterval(date: Date, interval: string): Date {
  const aligned = new Date(date);

  // interval 파싱
  const match = interval.match(/^(\d+)(m|h|d)$/);
  if (!match) return aligned;

  const value = parseInt(match[1]);
  const unit = match[2];

  // 현재 시간 정보
  const minutes = aligned.getMinutes();
  const hours = aligned.getHours();

  if (unit === 'm') {
    // 분 단위: 다음 interval 분으로 올림
    const nextMinute = Math.ceil(minutes / value) * value;
    if (nextMinute >= 60) {
      aligned.setHours(hours + 1);
      aligned.setMinutes(0);
    } else {
      aligned.setMinutes(nextMinute);
    }
    aligned.setSeconds(0);
    aligned.setMilliseconds(0);
  } else if (unit === 'h') {
    // 시간 단위: 다음 interval 시간으로 올림
    const nextHour = Math.ceil(hours / value) * value;
    if (nextHour >= 24) {
      aligned.setDate(aligned.getDate() + 1);
      aligned.setHours(0);
    } else {
      aligned.setHours(nextHour);
    }
    aligned.setMinutes(0);
    aligned.setSeconds(0);
    aligned.setMilliseconds(0);
  } else if (unit === 'd') {
    // 일 단위: 다음 자정으로 올림
    aligned.setDate(aligned.getDate() + 1);
    aligned.setHours(0);
    aligned.setMinutes(0);
    aligned.setSeconds(0);
    aligned.setMilliseconds(0);
  }

  return aligned;
}

/**
 * 상대 시간(TimeRange)을 절대 시간(start_time, end_time)으로 변환
 * 시간을 interval에 맞게 정렬하여 차트 x축이 깔끔하게 표시되도록 함
 * @param timeRange - 상대 시간 값 (예: "15min", "1h", "1d")
 * @returns start_time과 end_time (ISO 8601 형식)
 */
export function convertTimeRangeToParams(timeRange: TimeRange): TimeRangeParams {
  const now = new Date();
  const interval = getIntervalForTimeRange(timeRange);

  // 종료 시간: interval에 맞게 올림
  const alignedEnd = alignTimeToInterval(now, interval);

  // 시간 차이 계산 (밀리초)
  const timeRangeMap: Record<TimeRange, number> = {
    '15min': 15 * 60 * 1000,
    '30min': 30 * 60 * 1000,
    '45min': 45 * 60 * 1000,
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
  const alignedStart = new Date(alignedEnd.getTime() - diffMs);

  return {
    start_time: alignedStart.toISOString(),
    end_time: alignedEnd.toISOString(),
  };
}

/**
 * 시간 범위에 따라 적절한 interval 값을 계산
 * @param timeRange - 상대 시간 값
 * @returns interval 값 (예: "1m", "5m", "10m", "1h")
 */
export function getIntervalForTimeRange(timeRange: TimeRange): string {
  const intervalMap: Record<TimeRange, string> = {
    '15min': '1m', // 15분 → 1분 간격 (15개 포인트)
    '30min': '2m', // 30분 → 2분 간격 (15개 포인트)
    '45min': '3m', // 45분 → 3분 간격 (15개 포인트)
    '1h': '5m', // 1시간 → 5분 간격 (12개 포인트)
    '3h': '10m', // 3시간 → 10분 간격 (18개 포인트)
    '6h': '30m', // 6시간 → 30분 간격 (12개 포인트)
    '12h': '1h', // 12시간 → 1시간 간격 (12개 포인트)
    '1d': '2h', // 1일 → 2시간 간격 (12개 포인트)
    '1w': '12h', // 1주 → 12시간 간격 (14개 포인트)
    '2w': '1d', // 2주 → 1일 간격 (14개 포인트)
    '1M': '2d', // 1개월 → 2일 간격 (15개 포인트)
  };

  return intervalMap[timeRange];
}
