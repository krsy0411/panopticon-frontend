'use client';

import Table from '@/components/ui/Table';
import DatabaseIcon from '@/components/icons/services/Database';
import FrontendIcon from '@/components/icons/services/Frontend';
import ApiIcon from '@/components/icons/services/Api';
import ViewModeSelectBox from '../../../../components/features/apm/services/ViewModeSelectBox';
import PageSizeSelect from '../../../../components/features/apm/services/PageSizeSelect';
import Pagination from '../../../../components/features/apm/services/Pagination';
import { useState } from 'react';
import SearchInput from '@/components/ui/SearchInput';
import { SelectDate } from '@/components/features/apm/services/SelectDate';
import { useQuery } from '@tanstack/react-query';
import { getServices } from '@/src/api/apm';
import { ApmService, ServiceType } from '@/types/apm';

// 서비스 타입별 아이콘 렌더링 함수
const renderServiceIcon = (type: ServiceType) => {
  switch (type) {
    case 'DB':
      return <DatabaseIcon size={20} color="#3b82f6" />;
    case 'WEB':
      return <FrontendIcon size={20} color="#8b5cf6" />;
    case 'API':
    case 'API_GATEWAY':
      return <ApiIcon size={20} color="#10b981" />;
    case 'WORKER':
      return <ApiIcon size={20} color="#f59e0b" />;
    case 'CACHE':
      return <DatabaseIcon size={20} color="#06b6d4" />;
    default:
      return null;
  }
};

const columns = [
  {
    key: 'service_type' as keyof ApmService,
    header: 'Type',
    width: '12%',
    render: (_value: ApmService[keyof ApmService], row: ApmService) => (
      <div className="flex items-center gap-2">
        {renderServiceIcon(row.service_type)}
        <span className="text-sm text-gray-600">{row.service_type}</span>
      </div>
    ),
  },
  {
    key: 'service_name' as keyof ApmService,
    header: 'Name',
    width: '40%',
  },
  {
    key: 'request_count' as keyof ApmService,
    header: 'Requests',
    width: '12%',
    render: (value: ApmService[keyof ApmService]) => (value as number).toLocaleString(),
  },
  {
    key: 'error_rate' as keyof ApmService,
    header: 'Error Rate',
    width: '12%',
    render: (value: ApmService[keyof ApmService]) => (
      <span className={(value as number) > 2 ? 'text-red-600 font-semibold' : ''}>
        {value as number}%
      </span>
    ),
  },
  {
    key: 'p95_latency_ms' as keyof ApmService,
    header: 'P95 Latency',
    width: '12%',
    render: (value: ApmService[keyof ApmService]) => <span>{value as number}ms</span>,
  },
  {
    key: 'issues_count' as keyof ApmService,
    header: 'Issues',
    width: '12%',
    render: (value: ApmService[keyof ApmService]) => {
      const issueCount = value as number;
      return (
        <span
          className={`inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs font-semibold ${
            issueCount > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {issueCount}
        </span>
      );
    },
  },
];

export default function ServicesPage() {
  const [viewType, setViewType] = useState<'list' | 'map'>('list');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // API 데이터 가져오기
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['services', page, pageSize],
    queryFn: () => getServices({ page, size: pageSize }),
  });

  // 페이징 계산
  const total = data?.total_count || 0;
  const totalPages = Math.ceil(total / pageSize);
  const services = data?.services || [];

  // 페이지 변경 핸들러
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // 로딩 상태
  if (isLoading) {
    return (
      <div id="apm-services-container" className="p-8">
        <h1 className="text-2xl font-bold mb-6">서비스 목록</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div id="apm-services-container" className="p-8">
        <h1 className="text-2xl font-bold mb-6">서비스 목록</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">
            에러가 발생했습니다: {error instanceof Error ? error.message : '알 수 없는 에러'}
          </div>
        </div>
      </div>
    );
  }

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
        <>
          <Table<ApmService> columns={columns} data={services} showFavorite={true} />
          <Pagination page={page} totalPages={totalPages} onPrev={handlePrev} onNext={handleNext} />
        </>
      ) : (
        <div>맵 뷰 구현 예정...</div>
      )}
    </div>
  );
}
