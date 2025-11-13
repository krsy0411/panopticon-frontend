'use client';

import Table from '@/components/ui/Table';
import ViewModeSelectBox from '../../../../components/features/apm/services/ViewModeSelectBox';
import PageSizeSelect from '../../../../components/features/apm/services/PageSizeSelect';
import Pagination from '../../../../components/features/apm/services/Pagination';
import { useState, useMemo } from 'react';
import SearchInput from '@/components/ui/SearchInput';
import { SelectDate } from '@/components/features/apm/services/SelectDate';
import { useQuery } from '@tanstack/react-query';
import { getServices } from '@/src/api/apm';
import { ServiceSummary } from '@/types/apm';
import { useRouter } from 'next/navigation';
import StateHandler from '@/components/ui/StateHandler';

const columns = [
  {
    key: 'service_name' as keyof ServiceSummary,
    header: 'Name',
    width: '30%',
  },
  {
    key: 'environment' as keyof ServiceSummary,
    header: 'Environment',
    width: '15%',
    render: (value: ServiceSummary[keyof ServiceSummary]) => (
      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">{value as string}</span>
    ),
  },
  {
    key: 'request_count' as keyof ServiceSummary,
    header: 'Requests',
    width: '15%',
    render: (value: ServiceSummary[keyof ServiceSummary]) => (value as number).toLocaleString(),
  },
  {
    key: 'error_rate' as keyof ServiceSummary,
    header: 'Error Rate',
    width: '15%',
    render: (value: ServiceSummary[keyof ServiceSummary]) => {
      const errorRate = (value as number) * 100;
      return (
        <span className={errorRate > 2 ? 'text-red-600 font-semibold' : ''}>
          {errorRate.toFixed(2)}%
        </span>
      );
    },
  },
  {
    key: 'latency_p95_ms' as keyof ServiceSummary,
    header: 'P95 Latency',
    width: '15%',
    render: (value: ServiceSummary[keyof ServiceSummary]) => <span>{value as number}ms</span>,
  },
];

export default function ServicesPage() {
  const router = useRouter();
  const [viewType, setViewType] = useState<'list' | 'map'>('list');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 지난 2주일의 시간 범위 (useMemo로 안정화)
  const timeRange = useMemo(() => {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    return {
      from: twoWeeksAgo.toISOString(),
      to: now.toISOString(),
    };
  }, []);

  // API 데이터 가져오기
  const { data, isLoading, isError } = useQuery({
    queryKey: ['services', page, pageSize, timeRange],
    queryFn: () =>
      getServices({
        limit: pageSize,
        ...timeRange,
      }),
  });

  // 페이징 계산
  const services = data?.services || [];
  const total = services.length;
  const totalPages = Math.ceil(total / pageSize);
  const isEmpty = services.length === 0;

  // 페이지 변경 핸들러
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // 테이블 행 클릭 핸들러
  const handleServiceRowClick = (service: ServiceSummary) => {
    router.push(`/apm/services/${service.service_name}`);
  };

  return (
    <div id="apm-services-container" className="p-8">
      <h1 className="text-2xl font-bold mb-6">서비스 목록</h1>

      <SearchInput placeholder="서비스 검색..." className="mb-4 w-80 h-10" />

      <div className="flex justify-start items-center mb-2 gap-3">
        <SelectDate />
        <ViewModeSelectBox selected={viewType} onSelect={setViewType} />
        <PageSizeSelect
          value={pageSize}
          onChange={(v) => {
            setPageSize(v);
            setPage(1);
          }}
        />
      </div>

      {viewType === 'list' ? (
        <StateHandler
          isLoading={isLoading}
          isError={isError}
          isEmpty={isEmpty}
          type="table"
          height={500}
          loadingMessage="서비스 목록을 불러오는 중..."
          errorMessage="서비스 목록을 불러올 수 없습니다"
          emptyMessage="표시할 서비스가 없습니다"
        >
          <Table<ServiceSummary>
            columns={columns}
            data={services}
            showFavorite={true}
            onRowClick={handleServiceRowClick}
          />
          <Pagination page={page} totalPages={totalPages} onPrev={handlePrev} onNext={handleNext} />
        </StateHandler>
      ) : (
        <div>맵 뷰 구현 예정...</div>
      )}
    </div>
  );
}
