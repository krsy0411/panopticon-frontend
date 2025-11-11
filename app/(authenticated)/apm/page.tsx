'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiAlertOctagon } from 'react-icons/fi';
import { BiBug, BiGridAlt } from 'react-icons/bi';
import SearchInput from '@/components/ui/SearchInput';
import Table from '@/components/ui/Table';
import DatabaseIcon from '@/components/icons/services/Database';
import FrontendIcon from '@/components/icons/services/Frontend';
import ApiIcon from '@/components/icons/services/Api';
import { getServices, getIssues } from '@/src/api/apm';

// 서비스 타입별 아이콘 매핑
const SERVICE_TYPE_ICONS: Record<string, { icon: typeof DatabaseIcon; color: string }> = {
  DB: { icon: DatabaseIcon, color: '#3b82f6' },
  CACHE: { icon: DatabaseIcon, color: '#06b6d4' },
  API: { icon: ApiIcon, color: '#10b981' },
  API_GATEWAY: { icon: ApiIcon, color: '#8b5cf6' },
  WORKER: { icon: ApiIcon, color: '#f59e0b' },
  WEB: { icon: FrontendIcon, color: '#8b5cf6' },
};

const renderServiceIcon = (type: string) => {
  const config = SERVICE_TYPE_ICONS[type] || SERVICE_TYPE_ICONS.API;
  const IconComponent = config.icon;
  return <IconComponent size={20} color={config.color} />;
};

// Table Column 정의 (API 응답 기반)
interface TableService {
  service_type: string;
  service_name: string;
  request_count: number;
  p95_latency_ms: number;
  error_rate: number;
}

const columns = [
  {
    key: 'service_type' as keyof TableService,
    header: 'Type',
    width: '20%',
    render: (_value: TableService[keyof TableService], row: TableService) => (
      <div className="flex items-center gap-2">
        {renderServiceIcon(row.service_type)}
        <span className="text-sm text-gray-600">{row.service_type}</span>
      </div>
    ),
  },
  {
    key: 'service_name' as keyof TableService,
    header: 'Service',
    width: '25%',
  },
  {
    key: 'request_count' as keyof TableService,
    header: 'Requests',
    width: '20%',
    render: (value: TableService[keyof TableService]) => (value as number).toLocaleString(),
  },
  {
    key: 'p95_latency_ms' as keyof TableService,
    header: 'P95 Latency',
    width: '15%',
    render: (value: TableService[keyof TableService]) => (
      <span className="flex items-center gap-1">{value as number}ms</span>
    ),
  },
  {
    key: 'error_rate' as keyof TableService,
    header: 'Error Rate',
    width: '15%',
    render: (value: TableService[keyof TableService]) => (
      <span className={(value as number) > 2 ? 'text-red-600 font-semibold' : ''}>
        {value as number}%
      </span>
    ),
  },
];

export default function ApmPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // 타임스탬프는 useMemo로 안정화
  const timeRange = useMemo(() => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    return {
      start_time: oneHourAgo.toISOString(),
      end_time: now.toISOString(),
    };
  }, []);

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services', timeRange],
    queryFn: () => getServices(timeRange),
  });

  const { data: issuesData, isLoading: issuesLoading } = useQuery({
    queryKey: ['issues'],
    queryFn: getIssues,
  });

  // 검색 필터링
  const filteredServices =
    servicesData?.services.filter((service) =>
      service.service_name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  return (
    <>
      <div className="p-8 bg-gray-50 h-full space-y-6">
        {/* APM Services */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <BiGridAlt className="w-5 h-5 text-purple-500" />
              <h3 className="text-gray-900 text-sm">APM Services</h3>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">1h</span>
              <span className="text-gray-500 text-xs">Past 1 Hour</span>
            </div>

            {/* 검색창 + 필터 드롭다운 */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <SearchInput
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services"
                />
              </div>
              <select className="text-xs border border-gray-300 rounded px-3 py-2 text-gray-600">
                <option>env:sre-in-practice</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {servicesLoading ? (
            <div className="px-4 py-16 flex items-center justify-center">
              <p className="text-gray-400 text-sm">Loading services...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="px-4 py-16 flex flex-col items-center justify-center text-center">
              <FiAlertOctagon className="w-12 h-12 mb-3 text-purple-400" />
              <p className="text-gray-600 text-sm">No services match the filter</p>
              <p className="text-xs text-gray-400 mt-1">Please widen your filter</p>
            </div>
          ) : (
            <Table<TableService>
              columns={columns}
              data={filteredServices}
              showFavorite={true}
              className="w-full"
            />
          )}
        </div>

        {/* Issues Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BiBug className="w-4 h-4 text-purple-500" />
              <h3 className="text-gray-900 text-sm">Issues</h3>
            </div>
          </div>

          {/* Content */}
          {issuesLoading ? (
            <div className="px-4 py-16 flex items-center justify-center">
              <p className="text-gray-400 text-sm">Loading issues...</p>
            </div>
          ) : issuesData && issuesData.issues.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {issuesData.issues.map((issue) => (
                <div key={issue.issue_id} className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{issue.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Service: {issue.service_name} • Affected:{' '}
                        {issue.affected_requests.toLocaleString()} requests
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(issue.occurred_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-16 flex flex-col items-center justify-center text-center">
              <FiAlertOctagon className="w-12 h-12 mb-3 text-purple-400" />
              <p className="text-gray-600 text-sm">No matching results found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
