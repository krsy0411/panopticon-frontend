// 전체 Error 섹션 조립
'use client';

import ErrorSummary from '../errors/Summary';
import ErrorTrendChart from '../errors/TrendChart';
import ErrorDistribution from '../errors/Distribution';
import { useQuery } from '@tanstack/react-query';
import { getServiceErrors } from '@/src/api/apm';
import { useTimeRangeStore } from '@/src/store/timeRangeStore';

interface ErrorsSectionProps {
  serviceName: string;
}

export default function ErrorsSection({ serviceName }: ErrorsSectionProps) {
  const { startTime, endTime } = useTimeRangeStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['serviceErrors', serviceName, startTime, endTime],
    queryFn: () => getServiceErrors(serviceName, { from: startTime, to: endTime }),
  });

  if (isLoading) {
    return <div className="text-gray-500">Loading error data...</div>;
  }

  if (error) {
    return <div className="text-red-500">Failed to load error data</div>;
  }

  return (
    <div className="space-y-6">
      <ErrorSummary data={data} />
      <ErrorTrendChart data={data} />
      <ErrorDistribution data={data} />
    </div>
  );
}
