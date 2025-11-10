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

type ServiceType = 'DB' | 'Frontend' | 'API';

interface Service {
  type: ServiceType;
  name: string;
  requests: number;
  errorRate: number;
  p95Latency: number;
  issues: number;
}

// 서비스 타입별 아이콘 렌더링 함수
const renderServiceIcon = (type: ServiceType) => {
  switch (type) {
    case 'DB':
      return <DatabaseIcon size={20} color="#3b82f6" />;
    case 'Frontend':
      return <FrontendIcon size={20} color="#8b5cf6" />;
    case 'API':
      return <ApiIcon size={20} color="#10b981" />;
    default:
      return null;
  }
};

// 임시 데이터 (추후 API로 대체)
const services: Service[] = [
  {
    type: 'API',
    name: 'user-service',
    requests: 12453,
    errorRate: 0.5,
    p95Latency: 125,
    issues: 2,
  },
  {
    type: 'DB',
    name: 'payment-db',
    requests: 8234,
    errorRate: 1.2,
    p95Latency: 230,
    issues: 0,
  },
  {
    type: 'Frontend',
    name: 'web-app',
    requests: 5621,
    errorRate: 3.8,
    p95Latency: 340,
    issues: 5,
  },
  {
    type: 'API',
    name: 'notification-service',
    requests: 9876,
    errorRate: 0.8,
    p95Latency: 180,
    issues: 1,
  },
];

const columns = [
  {
    key: 'type' as keyof Service,
    header: 'Type',
    width: '12%',
    render: (_value: Service[keyof Service], row: Service) => (
      <div className="flex items-center gap-2">
        {renderServiceIcon(row.type)}
        <span className="text-sm text-gray-600">{row.type}</span>
      </div>
    ),
  },
  {
    key: 'name' as keyof Service,
    header: 'Name',
    width: '40%',
  },
  {
    key: 'requests' as keyof Service,
    header: 'Requests',
    width: '12%',
    render: (value: Service[keyof Service]) => (value as number).toLocaleString(),
  },
  {
    key: 'errorRate' as keyof Service,
    header: 'Error Rate',
    width: '12%',
    render: (value: Service[keyof Service]) => (
      <span className={(value as number) > 2 ? 'text-red-600 font-semibold' : ''}>
        {value as number}%
      </span>
    ),
  },
  {
    key: 'p95Latency' as keyof Service,
    header: 'P95 Latency',
    width: '12%',
    render: (value: Service[keyof Service]) => <span>{value as number}ms</span>,
  },
  {
    key: 'issues' as keyof Service,
    header: 'Issues',
    width: '12%',
    render: (value: Service[keyof Service]) => {
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

  // 페이징 계산
  const total = services.length;
  const totalPages = Math.ceil(total / pageSize);
  const pagedData = services.slice((page - 1) * pageSize, page * pageSize);

  // 페이지 변경 핸들러
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

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
          <Table<Service> columns={columns} data={pagedData} showFavorite={true} />
          <Pagination page={page} totalPages={totalPages} onPrev={handlePrev} onNext={handleNext} />
        </>
      ) : (
        <div>맵 뷰 구현 예정...</div>
      )}
    </div>
  );
}
