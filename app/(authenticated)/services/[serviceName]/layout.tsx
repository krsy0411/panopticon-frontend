'use client';

import Sidebar from '@/components/features/services/[serviceName]/Sidebar';
import { SelectDate } from '@/components/features/services/SelectDate';
import type { ReactNode } from 'react';
import { useTimeRangeStore } from '@/src/store/timeRangeStore';
import { TimeRange } from '@/types/time';
import { PRESET_RANGES } from '@/src/constants/timeRanges';

export const dynamicParams = true;

export default function ApmLayout({ children }: { children: ReactNode }) {
  const { timeRange, setTimeRange } = useTimeRangeStore();

  const handleTimeRangeChange = (range: TimeRange) => {
    // TimeRange 객체 전체를 store에 전달 (커스텀 날짜도 처리하기 위해)
    setTimeRange(range);
  };

  const selectedTimeRange: TimeRange = PRESET_RANGES.find((range) => range.value === timeRange) || {
    label: timeRange,
    value: timeRange,
  };

  return (
    <div className="bg-gray-50">
      <div className="flex gap-6 px-8 py-8">
        <div className="flex flex-col gap-4 sticky top-6 h-fit">
          <Sidebar />
          <SelectDate value={selectedTimeRange} onChange={handleTimeRangeChange} />
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
