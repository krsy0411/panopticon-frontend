'use client';
import { useRouter } from 'next/navigation';
import LogsSection from '@/components/features/apps/services/[serviceId]/section/Logs';
import { SelectDate } from '@/components/features/apps/services/SelectDate';
import TracesSection from '@/components/features/apps/services/[serviceId]/section/Traces';
import ChartsSection from '@/components/features/apps/services/[serviceId]/section/Charts';
import { TimeRange } from '@/types/time';
import ResourcesSection from '@/components/features/apps/services/[serviceId]/section/Resources';
import { useParams } from 'next/navigation';
import { useTimeRangeStore } from '@/src/store/timeRangeStore';
import type { TimeRange as TimeRangeType } from '@/src/utils/timeRange';
import { HiArrowLeft } from 'react-icons/hi2';

export default function ServiceOverview() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.serviceId as string;
  const appId = params.appId as string;

  // Zustand store 사용
  const { timeRange, setTimeRange } = useTimeRangeStore();

  // 서비스 목록으로 돌아가기
  const handleBackToServices = () => {
    router.push(`/apps/${appId}/services`);
  };

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
      {/* 뒤로가기 버튼 */}
      <button
        onClick={handleBackToServices}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors hover:cursor-pointer"
      >
        <HiArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">서비스 목록으로 돌아가기</span>
      </button>

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
        <div className="bg-white p-5 rounded-lg border border-gray-200">준비 중...</div>
        {/* <DependenciesSection serviceName={serviceId} /> */}
      </div>

      {/* 트레이스 영역 */}
      <div id="traces" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Traces</h2>
        <TracesSection serviceName={serviceId} />
      </div>

      {/* 에러 영역 */}
      <div id="errors" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Errors</h2>
        <div className="bg-white p-5 rounded-lg border border-gray-200">준비 중...</div>
        {/* <ErrorsSection serviceName={serviceId} /> */}
      </div>

      {/* 로그 영역 */}
      <div id="logs" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Logs</h2>
        <LogsSection serviceName={serviceId} />
      </div>
    </div>
  );
}
