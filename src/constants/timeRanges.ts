import { TimeRange } from '@/types/time';

/**
 * 시간 범위 프리셋 상수
 */
export const PRESET_RANGES: TimeRange[] = [
  { label: '지난 15분', value: '15min', hours: 0.25 },
  { label: '지난 30분', value: '30min', hours: 0.5 },
  { label: '지난 45분', value: '45min', hours: 0.75 },
  { label: '지난 1시간', value: '1h', hours: 1 },
  { label: '지난 3시간', value: '3h', hours: 3 },
  { label: '지난 6시간', value: '6h', hours: 6 },
  { label: '지난 9시간', value: '9h', hours: 9 },
  { label: '지난 12시간', value: '12h', hours: 12 },
  { label: '지난 하루', value: '1d', hours: 24 },
  { label: '지난 1주일', value: '1w', hours: 24 * 7 },
  { label: '지난 2주일', value: '2w', hours: 24 * 14 },
  { label: '지난 3주일', value: '3w', hours: 24 * 21 },
  { label: '지난 한 달', value: '1M', hours: 24 * 30 },
];
