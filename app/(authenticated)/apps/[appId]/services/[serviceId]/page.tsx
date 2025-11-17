'use client';
import LogsSection from '@/components/features/apps/services/[serviceId]/section/Logs';
import { SelectDate } from '@/components/features/apps/services/SelectDate';
import TracesSection from '@/components/features/apps/services/[serviceId]/section/Traces';
import { TimeRange } from '@/types/time';
import ResourcesSection from '@/components/features/apps/services/[serviceId]/section/Resources';
import { useParams } from 'next/navigation';
import { useTimeRangeStore } from '@/src/store/timeRangeStore';
import type { TimeRange as TimeRangeType } from '@/src/utils/timeRange';
import OverviewSection from '@/components/features/apps/services/[serviceId]/section/Overview';
import { PRESET_RANGES } from '@/src/constants/timeRanges';

export default function ServiceOverview() {
  const params = useParams();
  const serviceId = params.serviceId as string;

  const { timeRange, setTimeRange } = useTimeRangeStore();

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range.value as TimeRangeType);
  };

  const selectedTimeRange: TimeRange = PRESET_RANGES.find((range) => range.value === timeRange) || {
    label: timeRange,
    value: timeRange,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-4xl font-black text-gray-900">Summary</h1>

        <div className="flex justify-end">
          <SelectDate value={selectedTimeRange} onChange={handleTimeRangeChange} />
        </div>
      </div>

      <div id="overview" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">개요</h2>
        <OverviewSection serviceName={serviceId} />
      </div>

      <div id="resources" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">리소스</h2>
        <ResourcesSection serviceName={serviceId} />
      </div>

      <div id="traces" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">요청 추적</h2>
        <TracesSection serviceName={serviceId} />
      </div>

      <div id="errors-logs" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">에러 로그</h2>
        <LogsSection serviceName={serviceId} />
      </div>
    </div>
  );
}
