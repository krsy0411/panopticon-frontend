'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Table from '@/components/ui/Table';
import SearchInput from '@/components/ui/SearchInput';
import Pagination from '@/components/features/apm/services/Pagination';
import Dropdown from '@/components/ui/Dropdown';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

// API 응답 타입
interface ResourceResponse {
  resources: Resource[];
  total: number;
  page: number;
  limit: number;
}

interface Resource {
  resource_name: string;
  requests: number;
  total_time_ms: number;
  avg_time_ms: number;
  p95_latency_ms: number;
  errors: number;
  error_rate: number;
}

// 테이블용 데이터 타입
interface ResourceTableRow {
  resourceName: string;
  requests: number;
  totalTime: string;
  p95Latency: number;
  errors: number;
  errorRate: string;
}

// 테이블 컬럼 정의
const RESOURCE_TABLE_COLUMNS: Array<{
  key: keyof ResourceTableRow;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (
    value: ResourceTableRow[keyof ResourceTableRow],
    row: ResourceTableRow,
  ) => React.ReactNode;
}> = [
  {
    key: 'resourceName',
    header: 'RESOURCE NAME',
    width: '30%',
  },
  {
    key: 'requests',
    header: 'REQUESTS',
    width: '15%',
    render: (value: ResourceTableRow[keyof ResourceTableRow]) => {
      const num = Number(value);
      if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}k`;
      }
      return num.toLocaleString();
    },
  },
  {
    key: 'totalTime',
    header: 'TOTAL TIME',
    width: '15%',
  },
  {
    key: 'p95Latency',
    header: 'P95 LATENCY',
    width: '15%',
    render: (value: ResourceTableRow[keyof ResourceTableRow]) => {
      const ms = Number(value);
      if (ms >= 1000) {
        return `${(ms / 1000).toFixed(2)}s`;
      }
      return `${ms}ms`;
    },
  },
  {
    key: 'errors',
    header: 'ERRORS',
    width: '10%',
  },
  {
    key: 'errorRate',
    header: 'ERROR RATE',
    width: '15%',
    render: (value: ResourceTableRow[keyof ResourceTableRow]) => {
      const rate = parseFloat(String(value));
      return (
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
            rate > 5
              ? 'bg-red-100 text-red-700'
              : rate > 1
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {value}
        </span>
      );
    },
  },
];

// Resource를 TableRow로 변환
function transformResourceToTableRow(resource: Resource): ResourceTableRow {
  const totalTimeSeconds = resource.total_time_ms / 1000;
  let totalTimeStr = '';

  if (totalTimeSeconds >= 3600) {
    const hours = Math.floor(totalTimeSeconds / 3600);
    const minutes = Math.floor((totalTimeSeconds % 3600) / 60);
    totalTimeStr = `${hours}h ${minutes}m`;
  } else if (totalTimeSeconds >= 60) {
    const minutes = Math.floor(totalTimeSeconds / 60);
    const seconds = Math.floor(totalTimeSeconds % 60);
    totalTimeStr = `${minutes}m ${seconds}s`;
  } else {
    totalTimeStr = `${totalTimeSeconds.toFixed(1)}s`;
  }

  return {
    resourceName: resource.resource_name,
    requests: resource.requests,
    totalTime: totalTimeStr,
    p95Latency: resource.p95_latency_ms,
    errors: resource.errors,
    errorRate: `${resource.error_rate.toFixed(2)}%`,
  };
}

// 차트 색상 팔레트
const CHART_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
];

// 색상 선택 함수
function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

export default function ResourcesSection() {
  const [resources, setResources] = useState<ResourceTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Top N 상태 (각 차트별로 독립적으로 관리)
  const [requestsTopN, setRequestsTopN] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [latencyTopN, setLatencyTopN] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [errorsTopN, setErrorsTopN] = useState<1 | 2 | 3 | 4 | 5>(3);

  // Dropdown 옵션 정의
  const topNOptions = [
    { label: 'Top 1', value: 1 as const },
    { label: 'Top 2', value: 2 as const },
    { label: 'Top 3', value: 3 as const },
    { label: 'Top 4', value: 4 as const },
    { label: 'Top 5', value: 5 as const },
  ];

  const itemsPerPage = 15;

  // API 호출 함수
  const fetchResources = useCallback(async () => {
    try {
      // TODO: 실제 API 엔드포인트로 교체 필요
      // const serviceId = window.location.pathname.split('/').pop();
      // const response = await fetch(`/api/apm/services/${serviceId}/resources?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`);

      // 임시: 더미 데이터 생성 (실제 API 연동 시 제거)
      const mockResponse: ResourceResponse = {
        resources: Array.from({ length: 18 }, (_, i) => {
          const endpoints = [
            'GET /api/users/:id',
            'POST /api/orders',
            'GET /api/products',
            'PUT /api/users/:id',
            'DELETE /api/orders/:id',
            'GET /api/cart',
            'POST /api/checkout',
            'GET /api/search',
            'GET /api/categories',
            'POST /api/reviews',
            'GET /api/dashboard',
            'PATCH /api/settings',
          ];
          return {
            resource_name:
              endpoints[i % endpoints.length] +
              (i >= endpoints.length ? ` #${Math.floor(i / endpoints.length) + 1}` : ''),
            requests: Math.floor(Math.random() * 50000) + 100,
            total_time_ms: Math.floor(Math.random() * 10000000) + 10000,
            avg_time_ms: Math.floor(Math.random() * 500) + 50,
            p95_latency_ms: Math.floor(Math.random() * 1000) + 100,
            errors: Math.floor(Math.random() * 500),
            error_rate: Math.random() * 10,
          };
        }),
        total: 45,
        page: 1,
        limit: itemsPerPage,
      };

      const data = mockResponse;

      const transformedResources = data.resources.map(transformResourceToTableRow);
      // 요청 수 기준 내림차순 정렬
      transformedResources.sort((a, b) => b.requests - a.requests);
      setResources(transformedResources);
      setTotalCount(data.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
      console.error('Error fetching resources:', err);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // 페이지 계산
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // 페이지네이션 핸들러
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 검색 핸들러
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // 시간대 레이블 생성 (최근 24시간, 1시간 간격)
  const timeLabels = useMemo(() => {
    const labels: string[] = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      labels.push(
        time.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        }),
      );
    }
    return labels;
  }, []);

  // Requests 차트 옵션 (독립적인 Top N 적용)
  const requestsChartOption = useMemo(() => {
    const topResources = resources.slice(0, requestsTopN);
    const seriesData = topResources.map((resource, idx) => ({
      name: resource.resourceName,
      type: 'bar' as const,
      stack: 'total',
      data: timeLabels.map(() => Math.floor(Math.random() * 1000) + 100),
      itemStyle: {
        color: getChartColor(idx),
      },
    }));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        bottom: 0,
        textStyle: { fontSize: 10 },
      },
      grid: { left: 60, right: 20, top: 20, bottom: 100 },
      xAxis: {
        type: 'category',
        data: timeLabels,
        axisLabel: { color: '#6b7280', fontSize: 10, interval: 2, rotate: 45 },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#6b7280', fontSize: 10 },
        splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
      },
      series: seriesData,
    };
  }, [resources, requestsTopN, timeLabels]);

  // p95 Latency 차트 옵션 (독립적인 Top N 적용)
  const latencyChartOption = useMemo(() => {
    const topResources = resources.slice(0, latencyTopN);
    const seriesData = topResources.map((resource, idx) => ({
      name: resource.resourceName,
      type: 'line' as const,
      data: timeLabels.map(() => Math.floor(Math.random() * 500) + 50),
      smooth: true,
      lineStyle: {
        width: 2,
        color: getChartColor(idx),
      },
      itemStyle: {
        color: getChartColor(idx),
      },
    }));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        bottom: 0,
        textStyle: { fontSize: 10 },
      },
      grid: { left: 60, right: 20, top: 20, bottom: 100 },
      xAxis: {
        type: 'category',
        data: timeLabels,
        axisLabel: { color: '#6b7280', fontSize: 10, interval: 2, rotate: 45 },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#6b7280', fontSize: 10, formatter: '{value}ms' },
        splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
      },
      series: seriesData,
    };
  }, [resources, latencyTopN, timeLabels]);

  // Errors 차트 옵션 (독립적인 Top N 적용)
  const errorsChartOption = useMemo(() => {
    const topResources = resources.slice(0, errorsTopN);
    const seriesData = topResources.map((resource, idx) => ({
      name: resource.resourceName,
      type: 'bar' as const,
      stack: 'total',
      data: timeLabels.map(() => Math.floor(Math.random() * 50)),
      itemStyle: {
        color: getChartColor(idx),
      },
    }));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        bottom: 0,
        textStyle: { fontSize: 10 },
      },
      grid: { left: 60, right: 20, top: 20, bottom: 100 },
      xAxis: {
        type: 'category',
        data: timeLabels,
        axisLabel: { color: '#6b7280', fontSize: 10, interval: 2, rotate: 45 },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#6b7280', fontSize: 10 },
        splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
      },
      series: seriesData,
    };
  }, [resources, errorsTopN, timeLabels]);

  if (error) {
    return (
      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <div className="text-center text-red-500 py-8">
          <p className="font-semibold mb-2">Error loading resources</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading && resources.length === 0) {
    return (
      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <div className="text-center text-gray-500 py-8">Loading resources...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200">
      {/* 차트 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Requests 차트 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Requests</h3>
            <Dropdown value={requestsTopN} onChange={setRequestsTopN} options={topNOptions} />
          </div>
          <ReactECharts
            option={requestsChartOption}
            style={{ height: 250 }}
            notMerge={true} // 차트 옵션이 변경될 때마다 완전히 새로 고침
            lazyUpdate={true} // 성능 최적화(지연 업데이트)
          />
        </div>

        {/* p95 Latency 차트 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">p95 Latency</h3>
            <Dropdown value={latencyTopN} onChange={setLatencyTopN} options={topNOptions} />
          </div>
          <ReactECharts
            option={latencyChartOption}
            style={{ height: 250 }}
            notMerge={true} // 차트 옵션이 변경될 때마다 완전히 새로 고침
            lazyUpdate={true} // 성능 최적화(지연 업데이트)
          />
        </div>

        {/* Errors 차트 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Errors</h3>
            <Dropdown value={errorsTopN} onChange={setErrorsTopN} options={topNOptions} />
          </div>
          <ReactECharts
            option={errorsChartOption}
            style={{ height: 250 }}
            notMerge={true} // 차트 옵션이 변경될 때마다 완전히 새로 고침
            lazyUpdate={true} // 성능 최적화(지연 업데이트)
          />
        </div>
      </div>

      {/* 통계 정보 및 검색 */}
      <div className="flex justify-between items-center mb-4">
        <div className="w-64">
          <SearchInput value={searchQuery} onChange={handleSearch} placeholder="Search Resources" />
        </div>
      </div>

      {/* 테이블 */}
      <div className="mb-4">
        <Table<ResourceTableRow>
          columns={RESOURCE_TABLE_COLUMNS}
          data={resources}
          className="w-full"
        />
      </div>

      {/* 페이지네이션 */}
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPrev={handlePrevPage}
        onNext={handleNextPage}
      />
    </div>
  );
}
