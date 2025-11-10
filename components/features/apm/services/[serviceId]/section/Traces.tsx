'use client';
import Table from '@/components/ui/Table';
import Pagination from '@/components/features/apm/services/Pagination';
import PageSizeSelect from '@/components/features/apm/services/PageSizeSelect';
import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback } from 'react';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

// API 응답 타입
interface TraceResponse {
  traces: Trace[];
  total: number;
  page: number;
  limit: number;
}

interface Trace {
  trace_id: string;
  date: string; // ISO 8601 format
  resource: string;
  service: string;
  duration_ms: number;
  method: string;
  status_code: number;
  span_count: number;
  error: boolean;
}

// 차트용 데이터 포인트 타입
interface TracePoint {
  timestamp: string;
  duration: number;
  latencyBreakdown: number; // LATENCY BREAKDOWN 컬럼용 (duration과 동일한 값)
  status: 'success' | 'error';
  traceId: string;
  resource: string;
  service: string;
  statusCode: number;
}

// 테이블 컬럼 정의
const TRACE_TABLE_COLUMNS: Array<{
  key: keyof TracePoint;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (value: TracePoint[keyof TracePoint], row: TracePoint) => React.ReactNode;
}> = [
  {
    key: 'timestamp',
    header: 'DATE',
    width: '15%',
  },
  {
    key: 'resource',
    header: 'RESOURCE',
    width: '25%',
  },
  {
    key: 'service',
    header: 'SERVICE',
    width: '15%',
    render: (value: TracePoint[keyof TracePoint]) => (
      <div className="flex items-center">
        <span>{String(value)}</span>
      </div>
    ),
  },
  {
    key: 'duration',
    header: 'DURATION',
    width: '10%',
    render: (value: TracePoint[keyof TracePoint]) => {
      const ms = Number(value);
      if (ms >= 1000) {
        return `${(ms / 1000).toFixed(2)}s`;
      }
      return `${ms}ms`;
    },
  },
  {
    key: 'statusCode',
    header: 'STATUS CODE',
    width: '10%',
    render: (value: TracePoint[keyof TracePoint], row: TracePoint) => {
      const code = Number(value);
      const isError = row.status === 'error';
      return (
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
            isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {code}
        </span>
      );
    },
  },
  {
    key: 'latencyBreakdown',
    header: 'LATENCY BREAKDOWN',
    width: '25%',
    sortable: false,
    render: (value: TracePoint[keyof TracePoint]) => {
      const duration = Number(value);
      const maxDuration = 2000;
      const percentage = Math.min((duration / maxDuration) * 100, 100);

      return (
        <div className="w-full bg-gray-100 h-4 rounded overflow-hidden">
          <div className="h-full bg-yellow-400" style={{ width: `${percentage}%` }} />
        </div>
      );
    },
  },
];

// Trace를 TracePoint로 변환
function transformTraceToPoint(trace: Trace): TracePoint {
  const date = new Date(trace.date);
  return {
    timestamp: date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    duration: trace.duration_ms,
    latencyBreakdown: trace.duration_ms, // duration과 동일한 값
    status: trace.error || trace.status_code >= 400 ? 'error' : 'success',
    traceId: trace.trace_id,
    resource: trace.resource,
    service: trace.service,
    statusCode: trace.status_code,
  };
}

export default function TracesSection() {
  const [traces, setTraces] = useState<TracePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30); // 한 페이지에 보여줄 항목 수

  // API 호출 함수 (페이지네이션 반영)
  const fetchTraces = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: 실제 API 엔드포인트로 교체 필요
      // const serviceId = window.location.pathname.split('/').pop();
      // const response = await fetch(`/api/apm/services/${serviceId}/traces?page=${currentPage}&limit=${itemsPerPage}`);

      // 임시: 더미 데이터 생성 (페이지네이션 반영)
      const startIndex = (currentPage - 1) * itemsPerPage;
      const mockResponse: TraceResponse = {
        traces: Array.from({ length: itemsPerPage }, (_, i) => {
          const status_code = [200, 201, 400, 500][Math.floor(Math.random() * 4)];
          let error = false;
          if (status_code >= 400) {
            error = true;
          } else {
            error = false;
          }
          return {
            trace_id: `trace_${startIndex + i}_${Date.now()}`,
            date: new Date(Date.now() - Math.random() * 300000).toISOString(),
            resource: [
              `GET /api/users/${startIndex + i}`,
              `POST /api/orders`,
              `GET /api/products/${startIndex + i}`,
            ][Math.floor(Math.random() * 3)],
            service: ['user-service', 'order-service', 'product-service'][
              Math.floor(Math.random() * 3)
            ],
            duration_ms: Math.floor(Math.random() * 2000) + 50,
            method: ['GET', 'POST', 'PUT'][Math.floor(Math.random() * 3)],
            status_code,
            span_count: Math.floor(Math.random() * 10) + 1,
            error,
          };
        }),
        total: 1234,
        page: currentPage,
        limit: itemsPerPage,
      };

      // 실제 API 사용 시:
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // const data: TraceResponse = await response.json();

      const data = mockResponse;

      let transformedTraces = data.traces.map(transformTraceToPoint);
      // error=true가 먼저 오도록 정렬
      transformedTraces = transformedTraces.sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status === 'error' ? -1 : 1;
      });
      setTraces(transformedTraces);
      setTotalCount(data.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch traces');
      console.error('Error fetching traces:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    // currentPage, itemsPerPage 변경 시마다 데이터 로드
    fetchTraces();
  }, [fetchTraces]);

  // 상태별 색상 매핑
  const getColorByStatus = (status: string) => {
    switch (status) {
      case 'success':
        return '#10b981'; // green
      case 'error':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  // 상태별로 데이터 분리
  const successTraces = traces
    .filter((t) => t.status === 'success')
    .map((t) => [t.timestamp, t.duration]);
  const errorTraces = traces
    .filter((t) => t.status === 'error')
    .map((t) => [t.timestamp, t.duration]);

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: 60,
      right: 20,
      top: 60,
      bottom: 60,
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        rotate: 45,
        interval: 'auto',
        hideOverlap: true,
      },
      axisLine: { show: true, lineStyle: { color: '#9ca3af', width: 1 } },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: 'Duration (ms)',
      nameLocation: 'middle',
      nameGap: 45,
      nameTextStyle: { color: '#6b7280', fontSize: 12 },
      axisLabel: { color: '#6b7280', fontSize: 11 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderColor: 'transparent',
      textStyle: { color: '#f9fafb', fontSize: 12 },
      padding: 8,
      formatter: (params: { value: [string, number]; seriesName: string; dataIndex: number }) => {
        const [time, duration] = params.value;
        const status = params.seriesName;
        const trace = traces.filter((t) => t.status === status.toLowerCase())[params.dataIndex];

        if (!trace) return '';

        return `
          <div style="font-weight:600;margin-bottom:4px;">${status}</div>
          <div style="margin:2px 0;">Trace ID: ${trace.traceId}</div>
          <div style="margin:2px 0;">Service: ${trace.service}</div>
          <div style="margin:2px 0;">Resource: ${trace.resource}</div>
          <div style="margin:2px 0;">Time: ${time}</div>
          <div style="margin:2px 0;">Duration: ${duration} ms</div>
          <div style="margin:2px 0;">Status: ${trace.statusCode}</div>
        `;
      },
    },
    legend: {
      bottom: 0,
      data: ['Success', 'Error'],
      icon: 'circle',
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 15,
      textStyle: { color: '#6b7280', fontSize: 11 },
    },
    series: [
      {
        name: 'Success',
        type: 'scatter',
        data: successTraces,
        symbolSize: 8,
        itemStyle: {
          color: getColorByStatus('success'),
          opacity: 0.7,
        },
        emphasis: {
          itemStyle: {
            color: getColorByStatus('success'),
            opacity: 1,
            borderColor: '#fff',
            borderWidth: 2,
          },
        },
      },
      {
        name: 'Error',
        type: 'effectScatter',
        data: errorTraces,
        symbolSize: 10,
        itemStyle: {
          color: getColorByStatus('error'),
        },
        rippleEffect: {
          brushType: 'stroke',
          scale: 3,
          period: 4,
        },
        emphasis: {
          itemStyle: {
            color: getColorByStatus('error'),
            opacity: 1,
            borderColor: '#fff',
            borderWidth: 2,
          },
        },
      },
    ],
  };

  // 페이지 계산
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1); // 페이지 크기 변경 시 첫 페이지로 리셋
  };

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

  if (error) {
    return (
      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <div className="text-center text-red-500 py-8">
          <p className="font-semibold mb-2">Error loading traces</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading && traces.length === 0) {
    return (
      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <div className="text-center text-gray-500 py-8">Loading traces...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200">
      {/* 차트 */}
      <ReactECharts option={option} style={{ height: 400 }} />
      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <PageSizeSelect
          value={itemsPerPage}
          onChange={handlePageSizeChange}
          options={[10, 30, 50]}
        />
      </div>

      {/* 테이블 */}
      <div className="mt-6">
        <Table<TracePoint> columns={TRACE_TABLE_COLUMNS} data={traces} className="w-full" />
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
