'use client';

import { useMemo, useState } from 'react';
import Dropdown from '@/components/ui/Dropdown';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { getServiceEndpoints } from '@/src/api/apm';
import { useTimeRangeStore, POLLING_INTERVAL } from '@/src/store/timeRangeStore';
import { convertTimeRangeToParams } from '@/src/utils/timeRange';
import StateHandler from '@/components/ui/StateHandler';
import { EndpointSortBy } from '@/types/apm';
import Table from '@/components/ui/Table';
import Pagination from '@/components/features/services/Pagination';
import EndpointTraceAnalysis from '@/components/analysis/EndpointTraceAnalysis';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

// 페이지당 아이템 수 (리스트용)
const ITEMS_PER_PAGE = 10;
// API에서 가져올 총 엔드포인트 수
const TOTAL_ENDPOINTS_LIMIT = 200;

// ECharts Bar tooltip params 타입
interface BarTooltipParams {
  dataIndex: number;
  name: string;
  value: number;
}

// 차트 색상 팔레트 (차이가 확연히 보이도록 수정)
const CHART_COLORS = [
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#10b981', // emerald
];

type MetricType = 'requests' | 'latency' | 'error_rate';

// 엔드포인트 테이블용 데이터 타입
interface EndpointTableData {
  endpoint_name: string;
  request_count: number;
  latency_p95_ms: number;
  error_rate: number;
}

// 시각적 바를 포함한 렌더링 헬퍼 함수
const renderWithBar = (value: number, maxValue: number, formattedValue: string, color: string) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 relative h-6 bg-gray-100 rounded overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            opacity: 0.2,
          }}
        />
        <span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-gray-700">
          {formattedValue}
        </span>
      </div>
    </div>
  );
};

// 테이블 컬럼 정의 (함수로 변경하여 maxValues를 받음)
const getEndpointTableColumns = (
  maxRequestCount: number,
  maxLatency: number,
  maxErrorRate: number,
): Array<{
  key: keyof EndpointTableData;
  header: string;
  width?: string;
  render?: (
    value: EndpointTableData[keyof EndpointTableData],
    row: EndpointTableData,
  ) => React.ReactNode;
}> => [
  {
    key: 'endpoint_name',
    header: '엔드포인트',
    width: '40%',
  },
  {
    key: 'request_count',
    header: '요청수',
    width: '20%',
    render: (value: EndpointTableData[keyof EndpointTableData]) => {
      const count = Number(value);
      return renderWithBar(count, maxRequestCount, count.toLocaleString(), '#3b82f6');
    },
  },
  {
    key: 'latency_p95_ms',
    header: 'P95 레이턴시',
    width: '20%',
    render: (value: EndpointTableData[keyof EndpointTableData]) => {
      const ms = Number(value);
      const formattedValue = ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms.toFixed(2)}ms`;
      return renderWithBar(ms, maxLatency, formattedValue, '#f59e0b');
    },
  },
  {
    key: 'error_rate',
    header: '에러율',
    width: '20%',
    render: (value: EndpointTableData[keyof EndpointTableData]) => {
      const rate = Number(value) * 100;
      const formattedValue = `${rate.toFixed(2)}%`;
      return renderWithBar(rate, maxErrorRate * 100, formattedValue, '#ef4444');
    },
  },
];

interface ResourcesSectionProps {
  serviceName: string;
}

export default function ResourcesSection({ serviceName }: ResourcesSectionProps) {
  // Zustand store에서 시간 정보 가져오기
  const { timeRange } = useTimeRangeStore();

  // 선택된 메트릭 타입 (기본값: 요청수)
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('requests');

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);

  // 엔드포인트 트레이스 분석 패널 상태
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [isTracePanelOpen, setIsTracePanelOpen] = useState(false);

  // Dropdown 옵션 정의
  const metricOptions = [
    { label: '요청수', value: 'requests' as const },
    { label: '에러율', value: 'error_rate' as const },
    { label: 'p95 레이턴시', value: 'latency' as const },
  ];

  // selectedMetric을 EndpointSortBy로 변환
  const sortBy = useMemo<EndpointSortBy>(() => {
    if (selectedMetric === 'requests') return 'request_count';
    if (selectedMetric === 'error_rate') return 'error_rate';
    return 'latency_p95_ms';
  }, [selectedMetric]);

  // API 데이터 가져오기 (200개 엔드포인트, 선택된 메트릭으로 정렬, 3초마다 폴링)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['serviceEndpoints', serviceName, timeRange, sortBy],
    queryFn: () => {
      // 폴링할 때마다 현재 시간 기준으로 시간 범위 재계산
      const { start_time, end_time } = convertTimeRangeToParams(timeRange);

      return getServiceEndpoints(serviceName, {
        from: start_time,
        to: end_time,
        limit: TOTAL_ENDPOINTS_LIMIT,
        sort_by: sortBy,
      });
    },
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: true, // 백그라운드에서도 갱신
    staleTime: 0, // 즉시 stale 상태로 만들어 항상 최신 데이터 요청
    retry: false,
    throwOnError: false,
  });

  // 전체 엔드포인트 데이터 (테이블용)
  const allEndpoints = useMemo<EndpointTableData[]>(() => {
    if (!data?.endpoints) return [];
    return data.endpoints.map((endpoint) => ({
      endpoint_name: endpoint.endpoint_name,
      request_count: endpoint.request_count,
      latency_p95_ms: endpoint.latency_p95_ms,
      error_rate: endpoint.error_rate,
    }));
  }, [data]);

  // 상위 3개 엔드포인트 (차트용)
  const topEndpoints = useMemo(() => {
    return allEndpoints.slice(0, 3);
  }, [allEndpoints]);

  const isEmpty = allEndpoints.length === 0;

  // 현재 페이지의 데이터만 추출 (테이블용)
  const paginatedEndpoints = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return allEndpoints.slice(startIndex, endIndex);
  }, [allEndpoints, currentPage]);

  // 시각적 바를 위한 최댓값 계산
  const maxValues = useMemo(() => {
    if (allEndpoints.length === 0) {
      return { maxRequestCount: 1, maxLatency: 1, maxErrorRate: 1 };
    }
    return {
      maxRequestCount: Math.max(...allEndpoints.map((e) => e.request_count)),
      maxLatency: Math.max(...allEndpoints.map((e) => e.latency_p95_ms)),
      maxErrorRate: Math.max(...allEndpoints.map((e) => e.error_rate)),
    };
  }, [allEndpoints]);

  // 테이블 컬럼 생성 (최댓값 기반)
  const tableColumns = useMemo(
    () =>
      getEndpointTableColumns(
        maxValues.maxRequestCount,
        maxValues.maxLatency,
        maxValues.maxErrorRate,
      ),
    [maxValues],
  );

  // 차트 옵션
  const chartOption = useMemo(() => {
    // 파이차트 (요청수, 에러율)
    if (selectedMetric === 'requests' || selectedMetric === 'error_rate') {
      const pieData = topEndpoints.map((endpoint, idx) => ({
        name: endpoint.endpoint_name,
        value: selectedMetric === 'requests' ? endpoint.request_count : endpoint.error_rate * 100,
        itemStyle: {
          color: CHART_COLORS[idx],
        },
        // 전체 엔드포인트 정보를 추가로 저장
        endpointData: endpoint,
      }));

      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderColor: 'transparent',
          textStyle: { color: '#f9fafb', fontSize: 12 },
          padding: 10,
          formatter: (params: {
            name: string;
            value: number;
            percent: number;
            data: { endpointData: EndpointTableData };
          }) => {
            const endpoint = params.data.endpointData;
            return `
              <div style="font-weight:700;margin-bottom:6px;font-size:14px;">${params.name}</div>
              <div style="margin:4px 0;font-size:12px;">
                ${
                  selectedMetric === 'requests'
                    ? `Requests: ${params.value.toLocaleString()}`
                    : `Error Rate: ${params.value.toFixed(2)}%`
                } (${params.percent}%)
              </div>
              <div style="margin:4px 0;font-size:12px;">p95 Latency: ${endpoint.latency_p95_ms.toFixed(
                2,
              )}ms</div>
              <div style="margin:4px 0;font-size:12px;">Requests: ${endpoint.request_count.toLocaleString()}</div>
            `;
          },
        },
        legend: {
          orient: 'horizontal',
          bottom: 0,
          data: topEndpoints.map((e) => e.endpoint_name),
          textStyle: { fontSize: 11, color: '#6b7280' },
          type: 'scroll',
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '45%'],
            data: pieData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
            label: {
              show: true,
              formatter: '{d}%',
              fontSize: 12,
              color: '#374151',
            },
            labelLine: {
              show: true,
            },
          },
        ],
      };
    }

    // p95 레이턴시: 가로 막대(horizontal bar) 차트, y축에 엔드포인트 이름
    const yAxisData = topEndpoints.map((e) => e.endpoint_name);
    const barData = topEndpoints.map((e) => e.latency_p95_ms);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderColor: 'transparent',
        textStyle: { color: '#f9fafb', fontSize: 12 },
        padding: 10,
        formatter: (params: BarTooltipParams) => {
          const idx = params.dataIndex;
          const endpoint = topEndpoints[idx];
          if (!endpoint) return '';
          return `
            <div style="font-weight:700;margin-bottom:6px;font-size:14px;">${
              endpoint.endpoint_name
            }</div>
            <div style="margin:4px 0;font-size:12px;">p95 Latency: ${endpoint.latency_p95_ms.toFixed(
              2,
            )}ms</div>
            <div style="margin:4px 0;font-size:12px;">Requests: ${endpoint.request_count.toLocaleString()}</div>
            <div style="margin:4px 0;font-size:12px;">Error Rate: ${(
              endpoint.error_rate * 100
            ).toFixed(2)}%</div>
          `;
        },
      },
      legend: {
        show: false,
      },
      grid: { left: 100, right: 20, top: 40, bottom: 80 },
      xAxis: {
        type: 'value',
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
          formatter: '{value}ms',
        },
        splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
      },
      yAxis: {
        type: 'category',
        data: yAxisData,
        axisLabel: {
          color: '#6b7280',
          fontSize: 12,
        },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      },
      series: [
        {
          type: 'bar',
          data: barData.map((value, idx) => ({ value, itemStyle: { color: CHART_COLORS[idx] } })),
          barWidth: 24,
          label: {
            show: true,
            position: 'right',
            formatter: function (v: { value: number }) {
              return `${v.value.toFixed(2)}ms`;
            },
            color: '#374151',
            fontSize: 11,
          },
        },
      ],
    };
  }, [topEndpoints, selectedMetric]);

  // 페이지네이션 계산
  const totalPages = Math.max(1, Math.ceil(allEndpoints.length / ITEMS_PER_PAGE));

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

  // 메트릭 변경 시 페이지를 1로 리셋
  const handleMetricChange = (metric: MetricType) => {
    setSelectedMetric(metric);
    setCurrentPage(1);
  };

  // 엔드포인트 클릭 핸들러
  const handleEndpointClick = (endpointName: string) => {
    setSelectedEndpoint(endpointName);
    setIsTracePanelOpen(true);
  };

  // 트레이스 패널 닫기 핸들러
  const handleTracePanelClose = () => {
    setIsTracePanelOpen(false);
    setTimeout(() => setSelectedEndpoint(null), 300);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">리소스</h2>
        <div className="w-32">
          <Dropdown value={selectedMetric} onChange={handleMetricChange} options={metricOptions} />
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <StateHandler
          isLoading={isLoading}
          isError={isError}
          isEmpty={isEmpty}
          type="chart"
          height={600}
          loadingMessage="리소스 데이터를 불러오는 중..."
          errorMessage="리소스 데이터를 불러올 수 없습니다"
          emptyMessage="선택한 시간 범위에 리소스 데이터가 없습니다"
        >
          {/* 차트 영역 */}
          <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="text-md font-semibold text-gray-800 mb-3">상위 3개 엔드포인트</h4>
            <ReactECharts
              option={chartOption}
              style={{ height: 350 }}
              notMerge={true}
              lazyUpdate={true}
              onEvents={{
                click: (params: { name?: string; dataIndex?: number }) => {
                  const endpointName =
                    params.name ||
                    (params.dataIndex !== undefined &&
                      topEndpoints[params.dataIndex]?.endpoint_name);
                  if (endpointName) {
                    handleEndpointClick(endpointName);
                  }
                },
              }}
            />
          </div>

          {/* 테이블 영역 */}
          <div className="mt-6">
            <Table<EndpointTableData>
              columns={tableColumns}
              data={paginatedEndpoints}
              className="w-full"
              onRowClick={(row) => handleEndpointClick(row.endpoint_name)}
            />
          </div>

          {/* 페이지네이션 */}
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPrev={handlePrevPage}
            onNext={handleNextPage}
          />
        </StateHandler>
      </div>

      {/* Endpoint Trace Analysis Panel */}
      {selectedEndpoint && (
        <EndpointTraceAnalysis
          key={selectedEndpoint}
          isOpen={isTracePanelOpen}
          onClose={handleTracePanelClose}
          serviceName={serviceName}
          endpointName={selectedEndpoint}
        />
      )}
    </div>
  );
}
