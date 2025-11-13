// 전체 Error 섹션 조립
'use client';

import ErrorSummary from '../errors/Summary';
import ErrorTrendChart from '../errors/TrendChart';
import ErrorDistribution from '../errors/Distribution';
import { useQuery } from '@tanstack/react-query';
import { getServiceErrors } from '@/src/api/apm';
import { useTimeRangeStore } from '@/src/store/timeRangeStore';
import StateHandler from '@/components/ui/StateHandler';

interface ErrorsSectionProps {
  serviceName: string;
}

export default function ErrorsSection({ serviceName }: ErrorsSectionProps) {
  const { startTime, endTime } = useTimeRangeStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['serviceErrors', serviceName, startTime, endTime],
    queryFn: () => getServiceErrors(serviceName, { from: startTime, to: endTime }),
  });

  const isEmpty = !data || data.errors.length === 0;

  return (
    <StateHandler
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
      type="chart"
      height="400px"
      loadingMessage="에러 데이터를 불러오는 중..."
      errorMessage="에러 데이터를 불러올 수 없습니다"
      emptyMessage="선택한 시간 범위에 에러가 없습니다"
    >
      <div className="space-y-6">
        <ErrorSummary data={data} />
        <ErrorTrendChart data={data} />
        <ErrorDistribution data={data} />
      </div>
    </StateHandler>
  );
}
