'use client';

import { useState, useMemo } from 'react';
import Table from '@/components/ui/Table';
import SearchInput from '@/components/ui/SearchInput';
import Pagination from '@/components/features/apm/services/Pagination';
import Dropdown from '@/components/ui/Dropdown';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { getServiceEndpoints } from '@/src/api/apm';
import { EndpointMetrics } from '@/types/apm';
import { useTimeRangeStore } from '@/src/store/timeRangeStore';

// ResourceTableRow 타입 정의
interface ResourceTableRow {
  resourceName: string;
  requests: number;
  totalTime: string;
  p95Latency: number;
  errors: number;
  errorRate: string;
  date: string;
}
import {
  formatChartTimeLabel,
  getBarWidthForResources,
  getXAxisIntervalForResources,
} from '@/src/utils/chartFormatter';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface ResourcesSectionProps {
  serviceName: string;
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
    key: 'date',
    header: 'DATE',
    width: '13%',
  },
  {
    key: 'resourceName',
    header: 'RESOURCE NAME',
    width: '27%',
  },
  {
    key: 'requests',
    header: 'REQUESTS',
    width: '12%',
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
    width: '12%',
  },
  {
    key: 'p95Latency',
    header: 'P95 LATENCY',
    width: '12%',
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
    width: '14%',
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

// EndpointMetrics를 TableRow로 변환
function transformEndpointToTableRow(endpoint: EndpointMetrics): ResourceTableRow {
  // 에러 수 계산 (request_count * error_rate)
  const errors = Math.round(endpoint.request_count * endpoint.error_rate);

  // 총 시간 계산 (추정값: request_count * avg latency)
  const avgLatency = endpoint.latency_p95_ms * 0.8; // p95를 avg로 근사
  const totalTimeMs = endpoint.request_count * avgLatency;
  const totalTimeSeconds = totalTimeMs / 1000;

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

  // 현재 시간 포맷팅
  const date = new Date();
  const formattedDate = `${date.getMonth() + 1}/${date.getDate()} ${String(
    date.getHours(),
  ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(
    date.getSeconds(),
  ).padStart(2, '0')}`;

  return {
    resourceName: endpoint.endpoint_name,
    requests: endpoint.request_count,
    totalTime: totalTimeStr,
    p95Latency: endpoint.latency_p95_ms,
    errors,
    errorRate: `${(endpoint.error_rate * 100).toFixed(2)}%`,
    date: formattedDate,
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

export default function ResourcesSection({ serviceName }: ResourcesSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Zustand store에서 시간 정보 가져오기
  const { startTime, endTime, interval } = useTimeRangeStore();

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

  // API 데이터 가져오기
  const { data, isLoading, error } = useQuery({
    queryKey: ['serviceEndpoints', serviceName, startTime, endTime],
    queryFn: () =>
      getServiceEndpoints(serviceName, {
        from: startTime,
        to: endTime,
        environment: 'prod',
        limit: 100,
      }),
  });

  // 전체 데이터 변환
  const allResources = useMemo(() => {
    if (!data?.endpoints) return [];
    return data.endpoints.map((endpoint) => transformEndpointToTableRow(endpoint));
  }, [data]);

  const totalCount = allResources.length;

  // 현재 페이지의 데이터만 추출
  const resources = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allResources.slice(startIndex, endIndex);
  }, [allResources, currentPage, itemsPerPage]);

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

  // 시간대 레이블 생성 (interval에 따라 동적으로 생성)
  const timeLabels = useMemo(() => {
    const labels: string[] = [];
    const now = new Date();

    // interval에 따른 라벨 개수 결정
    let labelCount = 24; // 기본값
    if (['5m', '10m'].includes(interval)) {
      labelCount = 12; // 짧은 간격: 12개 라벨
    } else if (['30m', '1h'].includes(interval)) {
      labelCount = 12;
    } else if (['2h', '12h'].includes(interval)) {
      labelCount = 8;
    } else if (['1d', '2d'].includes(interval)) {
      labelCount = 6;
    }

    // 시간 레이블 생성
    const timeStep = Math.ceil(24 / labelCount);
    for (let i = 23; i >= 0; i--) {
      if ((23 - i) % timeStep === 0) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        labels.push(formatChartTimeLabel(time, interval));
      }
    }
    return labels;
  }, [interval]);

  // Requests 차트 옵션 (독립적인 Top N 적용)
  const requestsChartOption = useMemo(() => {
    const topResources = resources.slice(0, requestsTopN);
    const seriesData = topResources.map((resource: ResourceTableRow, idx: number) => ({
      name: resource.resourceName,
      type: 'bar' as const,
      stack: 'total',
      data: timeLabels.map(() => Math.floor(Math.random() * 1000) + 100),
      barWidth: getBarWidthForResources(interval),
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
        axisLabel: {
          color: '#6b7280',
          fontSize: 10,
          interval: getXAxisIntervalForResources(interval, timeLabels.length),
          rotate: 45,
        },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#6b7280', fontSize: 10 },
        splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
      },
      series: seriesData,
    };
  }, [resources, requestsTopN, timeLabels, interval]);

  // p95 Latency 차트 옵션 (독립적인 Top N 적용)
  const latencyChartOption = useMemo(() => {
    const topResources = resources.slice(0, latencyTopN);
    const seriesData = topResources.map((resource: ResourceTableRow, idx: number) => ({
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
        axisLabel: {
          color: '#6b7280',
          fontSize: 10,
          interval: getXAxisIntervalForResources(interval, timeLabels.length),
          rotate: 45,
        },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#6b7280', fontSize: 10, formatter: '{value}ms' },
        splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
      },
      series: seriesData,
    };
  }, [resources, latencyTopN, timeLabels, interval]);

  // Errors 차트 옵션 (독립적인 Top N 적용)
  const errorsChartOption = useMemo(() => {
    const topResources = resources.slice(0, errorsTopN);
    const seriesData = topResources.map((resource: ResourceTableRow, idx: number) => ({
      name: resource.resourceName,
      type: 'bar' as const,
      stack: 'total',
      data: timeLabels.map(() => Math.floor(Math.random() * 50)),
      barWidth: getBarWidthForResources(interval),
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
        axisLabel: {
          color: '#6b7280',
          fontSize: 10,
          interval: getXAxisIntervalForResources(interval, timeLabels.length),
          rotate: 45,
        },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#6b7280', fontSize: 10 },
        splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
      },
      series: seriesData,
    };
  }, [resources, errorsTopN, timeLabels, interval]);

  if (error) {
    return (
      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <div className="text-center text-red-500 py-8">
          <p className="font-semibold mb-2">Error loading resources</p>
          <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
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
