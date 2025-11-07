export type TimeRange = {
  label: string;
  value: string;
  hours?: number; // 시간 기반 옵션
  startDate?: Date; // 커스텀 날짜 선택
  endDate?: Date;
};
