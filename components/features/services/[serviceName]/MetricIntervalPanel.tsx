/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { getServiceTraces, getSpans, getLogs, getServiceMetrics } from '@/src/api/apm';
import { getServiceEndpoints } from '@/src/api/apm';
import EndpointPieChart from '@/components/common/EndpointPieChart';
import { useQuery } from '@tanstack/react-query';
import { IoClose } from 'react-icons/io5';
import TraceAnalysis from '@/components/analysis/TraceAnalysis';
import EndpointTraceAnalysis from '@/components/analysis/EndpointTraceAnalysis';
import Dropdown from '@/components/ui/Dropdown';
import LogGroups, { computeGroups } from '@/components/common/LogGroups';
import LogGroupPanel from '@/components/common/LogGroupPanel';
import StateHandler from '@/components/ui/StateHandler';
import Pagination from '../Pagination';
import type { GetServiceTracesResponse, GetSpansResponse, GetLogsResponse } from '@/types/apm';
import SlideOverLayout from '@/components/ui/SlideOverLayout';
import {
  getIntervalForTimeRange,
  TIME_RANGE_DURATION_MS,
  type TimeRange,
} from '@/src/utils/timeRange';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  start: number; // ms
  end: number; // ms
  chartData: any;
  serviceName: string;
  selectedChartType?: 'requests' | 'error_rate' | 'latency';
}

export default function MetricIntervalPanel({
  isOpen,
  onClose,
  start,
  end,
  chartData,
  serviceName,
  selectedChartType = 'requests',
}: Props) {
  // We'll short-circuit to a fallback render below if needed, after hooks
  // 필터링: 주어진 start..end 범위 내의 포인트만 사용
  const filterSeries = useCallback(
    (series: [number, number][]) => (series || []).filter((p) => p[0] >= start && p[0] <= end),
    [start, end],
  );

  // We'll try to use server-side aggregated metrics for this interval; see query below (after fromISO/toISO are available)

  const panelDurationMs = end - start;
  const timeRangeOrder: TimeRange[] = [
    '15min',
    '30min',
    '45min',
    '1h',
    '3h',
    '6h',
    '12h',
    '1d',
    '1w',
    '2w',
    '1M',
  ];
  const panelInterval = (() => {
    for (const key of timeRangeOrder) {
      if (panelDurationMs <= TIME_RANGE_DURATION_MS[key]) {
        return getIntervalForTimeRange(key);
      }
    }
    return getIntervalForTimeRange('1M');
  })();

  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [isLogGroupPanelOpen, setIsLogGroupPanelOpen] = useState(false);
  const [selectedLogGroup, setSelectedLogGroup] = useState<{
    key: string;
    title: string;
    items:
      | {
          id: string;
          level: string;
          service: string;
          traceId: string;
          message: string;
          timestamp: string;
        }[]
      | null;
  } | null>(null);

  const fromISO = new Date(start).toISOString();
  const toISO = new Date(end).toISOString();

  const metricsQuery = useQuery({
    queryKey: ['serviceMetricsInterval', serviceName, fromISO, toISO, panelInterval],
    queryFn: () =>
      getServiceMetrics(serviceName, { from: fromISO, to: toISO, interval: panelInterval }),
    enabled: isOpen && !!serviceName && start < end,
  });

  const metricsArray = useMemo(
    () =>
      Array.isArray(metricsQuery.data)
        ? metricsQuery.data
        : metricsQuery.data
        ? [metricsQuery.data]
        : [],
    [metricsQuery.data],
  );

  const requests = useMemo(() => {
    const server = (
      metricsArray.find((m) => m.metric_name === 'http_requests_total')?.points || []
    ).map((p) => [new Date(p.timestamp).getTime(), p.value] as [number, number]);
    return filterSeries(server.length ? server : chartData?.requests || []);
  }, [metricsArray, chartData, filterSeries]);

  const errorRate = useMemo(() => {
    const server = (metricsArray.find((m) => m.metric_name === 'error_rate')?.points || []).map(
      (p) => [new Date(p.timestamp).getTime(), p.value * 100] as [number, number],
    );
    return filterSeries(server.length ? server : chartData?.errorRate || []);
  }, [metricsArray, chartData, filterSeries]);

  const latency = useMemo(() => {
    const server = (metricsArray.find((m) => m.metric_name === 'latency_p95_ms')?.points || []).map(
      (p) => [new Date(p.timestamp).getTime(), p.value] as [number, number],
    );
    return filterSeries(server.length ? server : chartData?.latency?.p95 || []);
  }, [metricsArray, chartData, filterSeries]);

  const tracesQuery = useQuery<GetServiceTracesResponse>({
    queryKey: ['serviceTraces', serviceName, fromISO, toISO, 'duration_desc', 10],
    queryFn: () =>
      // top traces for the interval: limit to 10 and sort by duration desc
      getServiceTraces(serviceName, { from: fromISO, to: toISO, size: 10, sort: 'duration_desc' }),
    enabled: isOpen && !!serviceName && start < end,
  });

  // endpoints for the interval (top 5)
  const endpointsQuery = useQuery({
    queryKey: ['serviceEndpointsInterval', serviceName, fromISO, toISO],
    queryFn: () =>
      // limit to top 5 for pie chart
      getServiceEndpoints(serviceName, { from: fromISO, to: toISO, limit: 5 }),
    enabled: isOpen && !!serviceName && start < end,
  });

  const spansQuery = useQuery<GetSpansResponse>({
    queryKey: ['spansInterval', serviceName, fromISO, toISO],
    queryFn: () => getSpans({ from: fromISO, to: toISO, service_name: serviceName, size: 50 }),
    enabled: isOpen && !!serviceName && start < end,
  });

  const logsQuery = useQuery<GetLogsResponse>({
    queryKey: ['logsInterval', serviceName, fromISO, toISO],
    queryFn: () => getLogs({ from: fromISO, to: toISO, service_name: serviceName, size: 100 }),
    enabled: isOpen && !!serviceName && start < end,
  });

  // 진단용 로그
  useEffect(() => {
    if (metricsQuery.isError)
      console.error('MetricIntervalPanel metricsQuery error', metricsQuery.error);
    if (tracesQuery.isError)
      console.error('MetricIntervalPanel tracesQuery error', tracesQuery.error);
    if (spansQuery.isError) console.error('MetricIntervalPanel spansQuery error', spansQuery.error);
    if (logsQuery.isError) console.error('MetricIntervalPanel logsQuery error', logsQuery.error);
  }, [
    metricsQuery.isError,
    metricsQuery.error,
    tracesQuery.isError,
    tracesQuery.error,
    spansQuery.isError,
    spansQuery.error,
    logsQuery.isError,
    logsQuery.error,
  ]);

  const logEntries = useMemo(() => {
    return (logsQuery.data?.items || []).map((l, i) => ({
      id: `api-${l.service_name}-${l.timestamp}-${i}`,
      level: l.level,
      service: l.service_name,
      traceId: l.trace_id || '',
      message: l.message,
      timestamp: new Date(l.timestamp).toLocaleString(),
    }));
  }, [logsQuery.data]);

  // endpoint trace panel state
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [isEndpointPanelOpen, setIsEndpointPanelOpen] = useState(false);

  const [selectedMetric, setSelectedMetric] = useState<'requests' | 'error_rate' | 'latency'>(
    selectedChartType,
  );

  // selectedChartType이 변경되면 selectedMetric 업데이트
  useEffect(() => {
    setSelectedMetric(selectedChartType);
  }, [selectedChartType]);

  // 로그 그룹 페이징
  const [logPage, setLogPage] = useState(1);
  const logsPerPage = 12;

  const metricOptions = [
    { label: '요청수', value: 'requests' as const },
    { label: '에러율', value: 'error_rate' as const },
    { label: '지연시간', value: 'latency' as const },
  ];

  // NOTE: Pie rendering uses shared EndpointPieChart component below.

  // Clear selections when the panel is closed via onClose handler
  const handleClose = useCallback(() => {
    setSelectedTraceId(null);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const renderPanel = () => {
    try {
      return (
        <>
          <SlideOverLayout isOpen={isOpen} onClose={handleClose} widthClass="w-[75%]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">구간 상세 분석</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {serviceName} <br /> {new Date(start).toLocaleString()} ~{' '}
                  {new Date(end).toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors hover:cursor-pointer"
                aria-label="Close panel"
              >
                <IoClose className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Top-line overview metrics */}
            <div className="px-6 py-4">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs text-gray-500">요청수 (합계)</div>
                  <div className="font-semibold text-base mt-1">
                    {(requests?.length
                      ? requests.reduce((acc, cur) => acc + cur[1], 0)
                      : 0
                    ).toFixed(0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">평균 에러율</div>
                  <div className="font-semibold text-base mt-1">
                    {(errorRate?.length
                      ? errorRate.reduce((acc, cur) => acc + cur[1], 0) / errorRate.length
                      : 0
                    ).toFixed(2)}
                    %
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">평균 p95</div>
                  <div className="font-semibold text-base mt-1">
                    {(latency?.length
                      ? latency.reduce((acc, cur) => acc + cur[1], 0) / latency.length
                      : 0
                    ).toFixed(2)}{' '}
                    ms
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[calc(100%-160px)] overflow-y-scroll">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold">상위 엔드포인트</h4>
                      <div className="w-36">
                        <Dropdown
                          value={selectedMetric}
                          onChange={setSelectedMetric}
                          options={metricOptions}
                        />
                      </div>
                    </div>
                    <StateHandler
                      isLoading={endpointsQuery.isLoading}
                      isError={endpointsQuery.isError}
                      isEmpty={!endpointsQuery.data?.endpoints?.length}
                      type="chart"
                      loadingMessage="엔드포인트 데이터를 불러오는 중..."
                      errorMessage="엔드포인트 데이터를 불러올 수 없습니다"
                    >
                      {endpointsQuery.data?.endpoints?.length ? (
                        <EndpointPieChart
                          items={endpointsQuery.data.endpoints}
                          selectedMetric={selectedMetric}
                          height={360}
                          onSliceClick={(endpointName: string) => {
                            setSelectedEndpoint(endpointName);
                            setIsEndpointPanelOpen(true);
                          }}
                        />
                      ) : (
                        <div className="text-sm text-gray-500">데이터가 없습니다</div>
                      )}
                    </StateHandler>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold mb-3">상위 트레이스 (지연시간 기준)</h4>
                    <StateHandler
                      isLoading={tracesQuery.isLoading}
                      isError={tracesQuery.isError}
                      isEmpty={!tracesQuery.data?.traces?.length}
                      type="table"
                      loadingMessage="트레이스를 불러오는 중..."
                      errorMessage="트레이스를 불러올 수 없습니다"
                    >
                      <div className="space-y-3 max-h-[360px] overflow-y-auto">
                        {(tracesQuery.data?.traces || []).slice(0, 10).map((t) => (
                          <div
                            key={t.trace_id}
                            className="p-3 rounded-md hover:bg-gray-50 transition cursor-pointer border border-gray-100"
                            onClick={() => setSelectedTraceId(t.trace_id)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-mono text-sm break-all">{t.service_name}</div>
                                <div className="text-xs text-gray-500">{t.trace_id}</div>
                              </div>
                              <div className="text-right text-sm text-gray-600">
                                <div className="font-semibold">{t.duration_ms.toFixed(2)}ms</div>
                                <div className="text-xs">{t.status}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </StateHandler>
                  </div>
                </div>

                {/* Logs */}
                <div className="py-4">
                  <StateHandler
                    isLoading={logsQuery.isLoading}
                    isError={logsQuery.isError}
                    isEmpty={!logsQuery.data?.items?.length}
                    type="table"
                    loadingMessage="로그를 불러오는 중..."
                    errorMessage="로그를 불러올 수 없습니다"
                  >
                    <LogGroups
                      items={logEntries}
                      page={logPage}
                      pageSize={logsPerPage}
                      onGroupClick={(key, title, items) => {
                        setSelectedLogGroup({ key, title, items });
                        setIsLogGroupPanelOpen(true);
                      }}
                    />
                    <div className="mt-4">
                      <Pagination
                        page={logPage}
                        totalPages={Math.max(
                          1,
                          Math.ceil(computeGroups(logEntries).length / logsPerPage),
                        )}
                        onPrev={() => setLogPage(logPage - 1)}
                        onNext={() => setLogPage(logPage + 1)}
                      />
                    </div>
                  </StateHandler>
                </div>
              </div>
            </div>
          </SlideOverLayout>
          {selectedTraceId && (
            <TraceAnalysis
              isOpen={!!selectedTraceId}
              onClose={() => setSelectedTraceId(null)}
              traceId={selectedTraceId as string}
            />
          )}
          {isEndpointPanelOpen && selectedEndpoint && (
            <EndpointTraceAnalysis
              isOpen={isEndpointPanelOpen}
              onClose={() => {
                setIsEndpointPanelOpen(false);
                setSelectedEndpoint(null);
              }}
              serviceName={serviceName}
              endpointName={selectedEndpoint}
            />
          )}
          {isLogGroupPanelOpen && selectedLogGroup && (
            <LogGroupPanel
              isOpen={isLogGroupPanelOpen}
              group={selectedLogGroup as any}
              onClose={() => setIsLogGroupPanelOpen(false)}
            />
          )}
        </>
      );
    } catch (err) {
      console.error('MetricIntervalPanel render error:', err);
      return (
        <SlideOverLayout isOpen={isOpen} onClose={handleClose}>
          <div className="p-4">
            <div className="text-red-600">오류가 발생했습니다: 패널을 열 수 없습니다.</div>
          </div>
        </SlideOverLayout>
      );
    }
  };

  return renderPanel();
}
