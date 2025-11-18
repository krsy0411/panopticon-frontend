// 서비스 목록 테이블 (+페이지네이션, 즐겨찾기)
'use client';

import { useMemo, useState } from 'react';
import Table from '@/components/ui/Table';
import Pagination from '@/components/features/services/Pagination';
import type { ServiceSummary } from '@/types/apm';
import type { PaginationControls } from '@/types/servicelist';
import { getEnvironmentStyle } from '../../../../src/types/environmentStyles';

interface ServiceListTableProps {
  services: ServiceSummary[];
  pagination?: PaginationControls;
  onRowClick: (service: ServiceSummary) => void;
}

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
    render: (value: ServiceSummary[keyof ServiceSummary]) => {
      const environment = value as string;
      const styles = getEnvironmentStyle(environment);
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${styles.chip}`}
        >
          <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
          {environment}
        </span>
      );
    },
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
      const rate = ((value as number) * 100).toFixed(2);
      return <span>{rate}%</span>;
    },
  },
  {
    key: 'latency_p95_ms' as keyof ServiceSummary,
    header: 'P95 Latency',
    width: '15%',
    render: (value: ServiceSummary[keyof ServiceSummary]) => {
      const latency = (value as number).toFixed(2);
      return <span>{latency}ms</span>;
    },
  },
];

export default function ServiceListTable({
  services,
  pagination,
  onRowClick,
}: ServiceListTableProps) {
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>(() =>
    services.reduce<Record<string, boolean>>((acc, service) => {
      acc[service.service_name] = false;
      return acc;
    }, {}),
  );

  const handleFavoriteClick = (row: ServiceSummary) => {
    setFavoriteMap((prev) => ({
      ...prev,
      [row.service_name]: !prev[row.service_name],
    }));
  };

  const tableData: ServiceSummary[] = useMemo(
    () =>
      services.map(
        (service) =>
          ({
            ...service,
            isFavorite: favoriteMap[service.service_name] ?? false,
          } as ServiceSummary),
      ),
    [favoriteMap, services],
  );

  return (
    <>
      <Table<ServiceSummary>
        columns={columns}
        data={tableData}
        showFavorite
        onFavoriteClick={handleFavoriteClick}
        onRowClick={onRowClick}
      />
      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPrev={pagination.onPrev}
          onNext={pagination.onNext}
        />
      )}
    </>
  );
}
