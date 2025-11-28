import { create } from 'zustand';
import {
  convertTimeRangeToParams,
  getIntervalForTimeRange,
  type TimeRange,
} from '@/src/utils/timeRange';
import type { TimeRange as TimeRangeObject } from '@/types/time';

// 폴링 간격 (밀리초)
export const POLLING_MAIN_INTERVAL = 1500; // 1.5초
export const POLLING_DETAIL_INTERVAL = 5000; // 5초

// React Query 캐싱 설정 (밀리초)
export const QUERY_STALETIME_LOGS = 300000; // 5분
export const QUERY_STALETIME_DEFAULT = 30000; // 30초
export const QUERY_STALETIME_SLO = 300000; // 5분 (SLO/Webhook 정보 캐싱)

interface TimeRangeState {
  // 원본 timeRange 값
  timeRange: TimeRange;

  // 계산된 값들
  startTime: string;
  endTime: string;
  interval: string;

  // Actions
  setTimeRange: (timeRange: TimeRange | TimeRangeObject) => void;
}

// 기본값: 지난 15분
const DEFAULT_TIME_RANGE: TimeRange = '15min';
const defaultParams = convertTimeRangeToParams(DEFAULT_TIME_RANGE);
const defaultInterval = getIntervalForTimeRange(DEFAULT_TIME_RANGE);

export const useTimeRangeStore = create<TimeRangeState>((set) => ({
  timeRange: DEFAULT_TIME_RANGE,
  startTime: defaultParams.start_time,
  endTime: defaultParams.end_time,
  interval: defaultInterval,

  setTimeRange: (input) => {
    let timeRangeValue: TimeRange;
    let timeParams: { start_time: string; end_time: string };
    let interval: string;

    // input이 커스텀 날짜인지 확인 (startDate와 endDate가 있는 경우)
    if (typeof input === 'object' && 'startDate' in input && input.startDate && input.endDate) {
      // 커스텀 날짜 범위
      timeRangeValue = input.value as TimeRange;
      timeParams = {
        start_time: input.startDate.toISOString(),
        end_time: input.endDate.toISOString(),
      };

      // 커스텀 날짜 범위의 duration 계산 후 적절한 interval 선택
      const durationMs = input.endDate.getTime() - input.startDate.getTime();
      const durationDays = durationMs / (1000 * 60 * 60 * 24);

      if (durationDays <= 1) {
        interval = '20s';
      } else if (durationDays <= 3) {
        interval = '30m';
      } else if (durationDays <= 7) {
        interval = '2h';
      } else if (durationDays <= 14) {
        interval = '3h';
      } else if (durationDays <= 21) {
        interval = '4h';
      } else {
        interval = '12h';
      }
    } else {
      // 프리셋 시간 범위 (문자열 또는 객체의 value 프로퍼티 사용)
      const rangeValue = typeof input === 'string' ? input : (input as TimeRangeObject).value;
      timeRangeValue = rangeValue as TimeRange;
      timeParams = convertTimeRangeToParams(timeRangeValue);
      interval = getIntervalForTimeRange(timeRangeValue);
    }

    set({
      timeRange: timeRangeValue,
      startTime: timeParams.start_time,
      endTime: timeParams.end_time,
      interval,
    });
  },
}));
