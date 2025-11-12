'use client';
import LogsSection from '../../../../../components/features/apm/services/[serviceId]/section/Logs';
import { SelectDate } from '@/components/features/apm/services/SelectDate';
import TracesSection from '@/components/features/apm/services/[serviceId]/section/Traces';
import ChartsSection from '@/components/features/apm/services/[serviceId]/section/Charts';
import { TimeRange } from '@/types/time';
import ErrorsSection from '@/components/features/apm/services/[serviceId]/section/Errors';
import ResourcesSection from '@/components/features/apm/services/[serviceId]/section/Resources';
import DependenciesSection from '@/components/features/apm/services/[serviceId]/section/Dependencies';
import { useParams } from 'next/navigation';
import { useTimeRangeStore } from '@/src/store/timeRangeStore';
import type { TimeRange as TimeRangeType } from '@/src/utils/timeRange';

export default function ServiceOverview() {
  const params = useParams();
  const serviceId = params.serviceId as string;

  // Zustand store 사용
  const { timeRange, setTimeRange } = useTimeRangeStore();

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range.value as TimeRangeType);
  };

  // timeRange를 TimeRange 타입으로 변환 (SelectDate 컴포넌트용)
  const selectedTimeRange: TimeRange = {
    label: timeRange === '1h' ? '1 hour' : timeRange,
    value: timeRange,
  };

  return (
    <div className="space-y-8">
      {/* 개요 영역 */}
      <div id="overview" className="flex justify-between items-center mb-2 scroll-mt-8">
        <h1 className="text-2xl font-semibold text-gray-800">Overview</h1>

        {/* 날짜(기간) 선택 컴포넌트 */}
        <SelectDate value={selectedTimeRange} onChange={handleTimeRangeChange} />
      </div>

      {/* 차트 영역 */}
      <ChartsSection serviceName={serviceId} />

      {/* Resources section */}
      <div id="resources" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Resources</h2>
        <ResourcesSection serviceName={serviceId} />
      </div>

      {/* Dependencies section */}
      <div id="dependencies" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Dependencies</h2>
        <DependenciesSection serviceName={serviceId} />
      </div>

      {/* 트레이스 영역 */}
      <div id="traces" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Traces</h2>
        <TracesSection serviceName={serviceId} />
      </div>

      {/* 에러 영역 */}
      <div id="errors" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Errors</h2>
        <ErrorsSection serviceName={serviceId} />
      </div>

      {/* 로그 영역 */}
      <div id="logs" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Logs</h2>
        <LogsSection serviceName={serviceId} />
      </div>
    </div>
  );
}
