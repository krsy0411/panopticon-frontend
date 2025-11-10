'use client';
import LogsSection from '../../../../../components/features/apm/services/[serviceId]/section/Logs';
import { useState } from 'react';
import { SelectDate } from '@/components/features/apm/services/SelectDate';
import TracesSection from '@/components/features/apm/services/[serviceId]/section/Traces';
import ChartsSection from '@/components/features/apm/services/[serviceId]/section/Charts';
import { TimeRange } from '@/types/time';
import ResourcesSection from '@/components/features/apm/services/[serviceId]/section/Resources';

export default function ServiceOverview() {
  const [timeRange, setTimeRange] = useState<TimeRange | null>(null);

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };

  return (
    <div className="space-y-8">
      {/* 개요 영역 */}
      <div id="overview" className="flex justify-between items-center mb-2 scroll-mt-8">
        <h1 className="text-2xl font-semibold text-gray-800">Overview</h1>

        {/* 날짜(기간) 선택 컴포넌트 */}
        <SelectDate value={timeRange || undefined} onChange={handleTimeRangeChange} />
      </div>

      {/* 차트 영역 */}
      <ChartsSection timeRange={timeRange?.value || '5m'} />

      {/* Resources section - 준비중 */}
      <div id="resources" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Resources</h2>
        <ResourcesSection />
      </div>

      {/* Dependencies section - 준비중 */}
      <div id="dependencies" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Dependencies</h2>
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
          Coming soon...
        </div>
      </div>

      {/* 트레이스 영역 */}
      <div id="traces" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Traces</h2>
        <TracesSection />
      </div>

      {/* Errors section - 준비중 */}
      <div id="errors" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Errors</h2>
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
          Coming soon...
        </div>
      </div>

      {/* 로그 영역 */}
      <div id="logs" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Logs</h2>
        <LogsSection />
      </div>
    </div>
  );
}
