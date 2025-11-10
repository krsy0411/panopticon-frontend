'use client';

import { useState } from 'react';
import { FiAlertOctagon } from 'react-icons/fi';
import { BiBug, BiGridAlt } from 'react-icons/bi';
import SearchInput from '@/components/ui/SearchInput';
import Table from '@/components/ui/Table';
import DatabaseIcon from '@/components/icons/services/Database';
import FrontendIcon from '@/components/icons/services/Frontend';
import ApiIcon from '@/components/icons/services/Api';

type ServiceType = 'DB' | 'Frontend' | 'API';

interface ApmService {
  type: ServiceType;
  service: string;
  requests: number;
  latency: number;
  errorRate: number;
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
const services: ApmService[] = [
  {
    type: 'API',
    service: 'user-service',
    requests: 12453,
    latency: 125,
    errorRate: 0.5,
  },
  {
    type: 'DB',
    service: 'payment-db',
    requests: 8234,
    latency: 230,
    errorRate: 1.2,
  },
  {
    type: 'Frontend',
    service: 'web-app',
    requests: 5621,
    latency: 340,
    errorRate: 3.8,
  },
];

const columns = [
  {
    key: 'type' as keyof ApmService,
    header: 'Type',
    width: '20%',
    render: (_value: ApmService[keyof ApmService], row: ApmService) => (
      <div className="flex items-center gap-2">
        {renderServiceIcon(row.type)}
        <span className="text-sm text-gray-600">{row.type}</span>
      </div>
    ),
  },
  {
    key: 'service' as keyof ApmService,
    header: 'Service',
    width: '25%',
  },
  {
    key: 'requests' as keyof ApmService,
    header: 'Requests',
    width: '20%',
    render: (value: ApmService[keyof ApmService]) => (value as number).toLocaleString(),
  },
  {
    key: 'latency' as keyof ApmService,
    header: 'P99 Latency',
    width: '15%',
    render: (value: ApmService[keyof ApmService]) => (
      <span className="flex items-center gap-1">{value as number}ms</span>
    ),
  },
  {
    key: 'errorRate' as keyof ApmService,
    header: 'Error Rate',
    width: '15%',
    render: (value: ApmService[keyof ApmService]) => (
      <span className={(value as number) > 2 ? 'text-red-600 font-semibold' : ''}>
        {value as number}%
      </span>
    ),
  },
];

export default function ApmPage() {
  const [searchQuery, setSearchQuery] = useState('');

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
          {services.length === 0 ? (
            <div className="px-4 py-16 flex flex-col items-center justify-center text-center">
              <FiAlertOctagon className="w-12 h-12 mb-3 text-purple-400" />
              <p className="text-gray-600 text-sm">No services match the filter</p>
              <p className="text-xs text-gray-400 mt-1">Please widen your filter</p>
            </div>
          ) : (
            <Table<ApmService>
              columns={columns}
              data={services}
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

          {/* Empty State */}
          <div className="px-4 py-16 flex flex-col items-center justify-center text-center">
            <FiAlertOctagon className="w-12 h-12 mb-3 text-purple-400" />
            <p className="text-gray-600 text-sm">No matching results found</p>
          </div>
        </div>
      </div>
    </>
  );
}
