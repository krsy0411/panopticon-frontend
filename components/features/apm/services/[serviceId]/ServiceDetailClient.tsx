'use client';

import { useMemo } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
  dehydrate,
} from '@tanstack/react-query';
import { SelectDate } from '@/components/features/apm/services/SelectDate';
import ChartsSection from '@/components/features/apm/services/[serviceId]/section/Charts';
import ResourcesSection from '@/components/features/apm/services/[serviceId]/section/Resources';
import TracesSection from '@/components/features/apm/services/[serviceId]/section/Traces';
import ErrorsSection from '@/components/features/apm/services/[serviceId]/section/Errors';
import LogsSection from '@/components/features/apm/services/[serviceId]/section/Logs';
import { useTimeRangeStore } from '@/src/store/timeRangeStore';
import type { TimeRange as SelectDateValue } from '@/types/time';
import type { TimeRange as StoreTimeRange } from '@/src/utils/timeRange';
import type { GetServiceErrorsResponse } from '@/types/apm';

interface ServiceDetailClientProps {
  serviceId: string;
  initialErrors: GetServiceErrorsResponse;
}

export default function ServiceDetailClient({
  serviceId,
  initialErrors,
}: ServiceDetailClientProps) {
  const queryClient = useMemo(() => {
    const client = new QueryClient();
    client.setQueryData(
      ['serviceErrors', serviceId, initialErrors.from, initialErrors.to],
      initialErrors,
    );
    return client;
  }, [serviceId, initialErrors]);

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ServiceDetailContent serviceId={serviceId} />
      </HydrationBoundary>
    </QueryClientProvider>
  );
}

function ServiceDetailContent({ serviceId }: { serviceId: string }) {
  const { timeRange, setTimeRange } = useTimeRangeStore();

  const selectedTimeRange: SelectDateValue = {
    label: timeRange === '1h' ? '1 hour' : timeRange,
    value: timeRange,
  };

  const handleTimeRangeChange = (range: SelectDateValue) => {
    setTimeRange(range.value as StoreTimeRange);
  };

  return (
    <div className="space-y-8">
      <header id="overview" className="flex justify-between items-center mb-2 scroll-mt-8">
        <h1 className="text-2xl font-semibold text-gray-800">Overview</h1>
        <SelectDate value={selectedTimeRange} onChange={handleTimeRangeChange} />
      </header>

      <ChartsSection serviceName={serviceId} />

      <section id="resources" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Resources</h2>
        <ResourcesSection serviceName={serviceId} />
      </section>

      <section id="dependencies" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Dependencies</h2>
        <div className="bg-white p-5 rounded-lg border border-gray-200">준비중...</div>
      </section>

      <section id="traces" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Traces</h2>
        <TracesSection serviceName={serviceId} />
      </section>

      <section id="errors" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Errors</h2>
        <ErrorsSection serviceName={serviceId} />
      </section>

      <section id="logs" className="pt-4 scroll-mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Logs</h2>
        <LogsSection serviceName={serviceId} />
      </section>
    </div>
  );
}
