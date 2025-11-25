'use client';
import Table from '@/components/ui/Table';
import Pagination from '@/components/features/services/Pagination';
import dynamic from 'next/dynamic';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getServiceTraces } from '@/src/api/apm';
import { TraceSummary } from '@/types/apm';
import { useTimeRangeStore, POLLING_INTERVAL } from '@/src/store/timeRangeStore';
import { getTimeAxisFormatter } from '@/src/utils/chartFormatter';
import { convertTimeRangeToParams, getChartXAxisRange } from '@/src/utils/timeRange';
import StateHandler from '@/components/ui/StateHandler';
import TraceAnalysis from '@/components/analysis/TraceAnalysis';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false }); // Import from utility

interface TracesSectionProps {
  serviceName: string;
}

// 테이블용 데이터 포인트 타입
interface TracePoint {
  timestamp: string;
  duration: number;
  latencyBreakdown: number; // LATENCY BREAKDOWN 컬럼용 (duration과 동일한 값)
  status: 'success' | 'error';
  traceId: string;
  resource: string;
  service: string;
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
    header: '날짜',
    width: '15%',
  },
  {
    key: 'resource',
    header: '리소스',
    width: '25%',
  },
  {
    key: 'service',
    header: '서비스',
    width: '15%',
    render: (value: TracePoint[keyof TracePoint]) => (
      <div className="flex items-center">
        <span>{String(value)}</span>
      </div>
    ),
  },
  {
    key: 'duration',
    header: '레이턴시 (ms)',
    width: '15%',
    render: (value: TracePoint[keyof TracePoint]) => {
      const ms = Number(value);
      if (ms >= 1000) {
        return `${(ms / 1000).toFixed(2)}s`;
      }
      return `${ms.toFixed(2)}ms`;
    },
  },
  {
    key: 'status',
    header: '상태',
    width: '10%',
    render: (value: TracePoint[keyof TracePoint]) => {
      const status = String(value);
      const isError = status === 'error';
      return (
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
            isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {isError ? 'ERROR' : 'OK'}
        </span>
      );
    },
  },
  {
    key: 'latencyBreakdown',
    header: '레이턴시 분해',
    width: '30%',
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

// TraceSummary를 TracePoint로 변환 (테이블 표시용)
function transformTraceToPoint(trace: TraceSummary): TracePoint {
  const date = new Date(trace.start_time);
  const timestamp = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(
    2,
    '0',
  )}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  return {
    timestamp,
    duration: trace.duration_ms,
    latencyBreakdown: trace.duration_ms, // duration과 동일한 값
    status: trace.status === 'ERROR' ? 'error' : 'success',
    traceId: trace.trace_id,
    resource: trace.root_span_name,
    service: trace.service_name,
  };
}

export default function TracesSection({ serviceName }: TracesSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // 페이지당 15개 고정
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Zustand store에서 시간 정보 가져오기
  const { timeRange, interval } = useTimeRangeStore();

  // 모든 트레이스 데이터 가져오기 (그래프 및 테이블 공용, 3초마다 폴링)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['serviceTraces', serviceName, timeRange],
    queryFn: () => {
      // 폴링할 때마다 현재 시간 기준으로 시간 범위 재계산
      const { start_time, end_time } = convertTimeRangeToParams(timeRange);

      return getServiceTraces(serviceName, {
        from: start_time,
        to: end_time,
        page: 1,
        size: 200, // 현재 200개가 최대
      });
    },
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: true, // 백그라운드에서도 갱신
    staleTime: 0, // 즉시 stale 상태로 만들어 항상 최신 데이터 요청
  });

  // 전체 트레이스 데이터 변환 (최신순 정렬)
  const allTraces = useMemo(() => {
    if (!data?.traces) return [];
    return [...data.traces].sort(
      (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
    );
  }, [data]);

  const totalCount = allTraces.length;
  const isEmpty = allTraces.length === 0;

  // 현재 페이지의 데이터만 추출 (테이블용, TracePoint로 변환)
  const traces = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allTraces.slice(startIndex, endIndex).map(transformTraceToPoint);
  }, [allTraces, currentPage]);

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

  // X축 범위 계산 (현재 시각 기준)
  const { min: xAxisMin, max: xAxisMax } = useMemo(
    () => getChartXAxisRange(timeRange),
    [timeRange],
  );

  // 상태별로 데이터 분리 (그래프는 모든 트레이스 사용)
  const successTraces = allTraces
    .filter((t) => t.status !== 'ERROR')
    .map((t) => [new Date(t.start_time).getTime(), t.duration_ms]);

  const errorTraces = allTraces
    .filter((t) => t.status === 'ERROR')
    .map((t) => [new Date(t.start_time).getTime(), t.duration_ms]);

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: 60,
      right: 20,
      top: 60,
      bottom: 60,
    },
    xAxis: {
      type: 'time',
      min: xAxisMin,
      max: xAxisMax,
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        formatter: getTimeAxisFormatter(interval),
        hideOverlap: true,
      },
      axisLine: { show: true, lineStyle: { color: '#9ca3af', width: 1 } },
      axisTick: { show: false },
      splitLine: { show: false },
      splitNumber: 20,
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
      textStyle: { color: '#f9fafb', fontSize: 28 },
      padding: 12,
      formatter: (params: { value: [number, number]; seriesName: string; dataIndex: number }) => {
        const [timestamp, duration] = params.value;
        const status = params.seriesName;
        const isError = status === 'Error';
        const trace = allTraces.filter((t) =>
          isError ? t.status === 'ERROR' : t.status !== 'ERROR',
        )[params.dataIndex];

        if (!trace) return '';

        const date = new Date(timestamp);
        const formattedTime = date.toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        return `
          <div style="font-weight:700;margin-bottom:6px;font-size:28px;line-height:1.2;${
            status === 'Error' ? 'color:#ef4444;' : 'color:#10b981;'
          }">${status}</div>
          <div style="line-height:1.2;font-size:20px;">트레이스 ID: ${trace.trace_id}</div>
          <div style="line-height:1.2;font-size:20px;">서비스: ${trace.service_name}</div>
          <div style="line-height:1.2;font-size:20px;">리소스: ${trace.root_span_name}</div>
          <div style="line-height:1.2;font-size:20px;">타임 스탬프: ${formattedTime}</div>
          <div style="line-height:1.2;font-size:20px;">총 시간: ${duration.toFixed(2)} ms</div>
          <div style="margin-top:6px;color:#3b82f6;font-size:14px;${
            status === 'Error' ? 'color:#ef4444;' : 'color:#10b981;'
          }">클릭하여 세부 정보 보기</div>
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
        type: 'scatter',
        data: errorTraces,
        symbolSize: 10,
        itemStyle: {
          color: getColorByStatus('error'),
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

  // 트레이스 클릭 핸들러
  const handleTraceClick = (traceId: string) => {
    setSelectedTraceId(traceId);
    setIsPanelOpen(true);
  };

  // 패널 닫기 핸들러
  const handleClosePanel = () => {
    setIsPanelOpen(false);
    // 애니메이션이 끝난 후 selectedTraceId 초기화
    setTimeout(() => setSelectedTraceId(null), 300);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">요청 추적</h2>
      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <StateHandler
          isLoading={isLoading}
          isError={isError}
          isEmpty={isEmpty}
          type="chart"
          height={600}
          loadingMessage="트레이스 데이터를 불러오는 중..."
          errorMessage="트레이스 데이터를 불러올 수 없습니다"
          emptyMessage="선택한 시간 범위에 트레이스가 없습니다"
        >
          {/* 차트 */}
          <ReactECharts
            option={option}
            style={{ height: 400 }}
            notMerge={true}
            onEvents={{
              click: (params: { seriesName: string; dataIndex: number }) => {
                const isError = params.seriesName === 'Error';
                const trace = allTraces.filter((t) =>
                  isError ? t.status === 'ERROR' : t.status !== 'ERROR',
                )[params.dataIndex];
                if (trace) {
                  handleTraceClick(trace.trace_id);
                }
              },
            }}
          />

          {/* 테이블 */}
          <div className="mt-6">
            <Table<TracePoint>
              columns={TRACE_TABLE_COLUMNS}
              data={traces}
              className="w-full"
              onRowClick={(row) => handleTraceClick(row.traceId)}
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

        {/* Trace Analysis Panel */}
        {selectedTraceId && (
          <TraceAnalysis
            key={selectedTraceId}
            isOpen={isPanelOpen}
            onClose={handleClosePanel}
            traceId={selectedTraceId}
          />
        )}
      </div>
    </div>
  );
}
