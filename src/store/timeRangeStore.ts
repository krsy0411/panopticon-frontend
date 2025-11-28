import { create } from 'zustand';
import {
  convertTimeRangeToParams,
  getIntervalForTimeRange,
  type TimeRange,
} from '@/src/utils/timeRange';

// 폴링 간격 (밀리초)
export const POLLING_MAIN_INTERVAL = 1000; // 1초
export const POLLING_DETAIL_INTERVAL = 5000; // 5초

interface TimeRangeState {
  // 원본 timeRange 값
  timeRange: TimeRange;

  // 계산된 값들
  startTime: string;
  endTime: string;
  interval: string;

  // Actions
  setTimeRange: (timeRange: TimeRange) => void;
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

  setTimeRange: (timeRange) => {
    const timeParams = convertTimeRangeToParams(timeRange);
    const interval = getIntervalForTimeRange(timeRange);

    set({
      timeRange,
      startTime: timeParams.start_time,
      endTime: timeParams.end_time,
      interval,
    });
  },
}));
