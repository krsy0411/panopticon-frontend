// 상단 Error Rate, Count 카드

'use client';

import StatGrid from '@/components/ui/StatGrid';
import type { StatItem } from '@/types/apm';
import { useQuery } from '@tanstack/react-query';
import { getServiceErrors } from '@/src/api/apm';
import { useTimeRangeStore } from '@/src/store/timeRangeStore';
import { useMemo } from 'react';

interface ErrorSummaryProps {
  serviceName: string;
}

export default function ErrorSummary({ serviceName }: ErrorSummaryProps) {
  const { startTime, endTime } = useTimeRangeStore();

  const { data } = useQuery({
    queryKey: ['serviceErrors', serviceName, startTime, endTime],
    queryFn: () => getServiceErrors(serviceName, { start_time: startTime, end_time: endTime }),
  });

  const summaryItems: StatItem[] = useMemo(() => {
    if (!data) {
      return [
        { id: 'error_rate', label: 'Error Rate', value: 0, tone: 'info' },
        { id: 'error_count', label: 'Error Count', value: 0, tone: 'danger' },
      ];
    }

    const totalErrors = data.errors.reduce((sum, error) => sum + error.count, 0);
    // 에러율 계산 (실제로는 백엔드에서 제공해야 하지만, 여기서는 임시로 계산)
    const errorRate = totalErrors > 0 ? 2.3 : 0; // TODO: 실제 에러율 계산 로직 필요

    return [
      { id: 'error_rate', label: 'Error Rate', value: errorRate, tone: 'info' },
      { id: 'error_count', label: 'Error Count', value: totalErrors, tone: 'danger' },
    ];
  }, [data]);

  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Error Summary</h2>
      <StatGrid items={summaryItems} />
    </div>
  );
}
