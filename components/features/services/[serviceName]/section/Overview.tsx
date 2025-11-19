'use client';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getServiceMetrics } from '@/src/api/apm';
import StateHandler from '@/components/ui/StateHandler';
import { POLLING_INTERVAL, useTimeRangeStore } from '@/src/store/timeRangeStore';
import { convertTimeRangeToParams, getChartXAxisRange } from '@/src/utils/timeRange';
import { getTimeAxisFormatter, getBarMaxWidthForTimeAxis } from '@/src/utils/chartFormatter';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface OverviewSectionProps {
  serviceName: string;
}

export default function OverviewSection({ serviceName }: OverviewSectionProps) {
  // Zustand store에서 시간 정보 가져오기 (timeRange만 사용)
  const { timeRange, interval } = useTimeRangeStore();

  // API 데이터 가져오기 (10초마다 폴링, 매번 최신 시간 범위로 요청)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['serviceMetrics', serviceName, timeRange, interval],
    queryFn: () => {
      // 폴링할 때마다 현재 시간 기준으로 시간 범위 재계산
      const { start_time, end_time } = convertTimeRangeToParams(timeRange);

      return getServiceMetrics(serviceName, {
        from: start_time,
        to: end_time,
        interval: interval,
      });
    },
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: true, // 백그라운드에서도 갱신
    staleTime: 0, // 즉시 stale 상태로 만들어 항상 최신 데이터 요청
  });

  // 차트 데이터 변환 (새로운 API 응답 형식: 배열 또는 단일 객체)
  const metricsArray = useMemo(() => (Array.isArray(data) ? data : data ? [data] : []), [data]);

  // 데이터 없음 체크
  const isEmpty = metricsArray.length === 0 || !metricsArray[0]?.points.length;

  // X축 고정 범위 계산 및 차트 데이터 변환
  const { xAxisMin, xAxisMax, chartData } = useMemo(() => {
    // 항상 현재 시각을 기준으로 X축 범위 설정
    const { min, max } = getChartXAxisRange(timeRange);
    const xAxisMin = min;
    const xAxisMax = max;

    // 시간 기반 X축을 위한 timestamp-value 페어
    const chartData = {
      requests:
        metricsArray
          .find((m) => m.metric_name === 'http_requests_total')
          ?.points.map((p) => [new Date(p.timestamp).getTime(), p.value]) || [],
      errorRate:
        metricsArray
          .find((m) => m.metric_name === 'error_rate')
          ?.points.map((p) => [new Date(p.timestamp).getTime(), p.value * 100]) || [],
      latency: {
        p95:
          metricsArray
            .find((m) => m.metric_name === 'latency_p95_ms')
            ?.points.map((p) => [new Date(p.timestamp).getTime(), p.value]) || [],
        p90:
          metricsArray
            .find((m) => m.metric_name === 'latency_p90_ms')
            ?.points.map((p) => [new Date(p.timestamp).getTime(), p.value]) || [],
        p50:
          metricsArray
            .find((m) => m.metric_name === 'latency_p50_ms')
            ?.points.map((p) => [new Date(p.timestamp).getTime(), p.value]) || [],
      },
    };

    return { xAxisMin, xAxisMax, chartData };
  }, [metricsArray, timeRange]);

  /* -------------------- 차트 공통 스타일 ------------------ */
  const baseStyle = {
    backgroundColor: 'transparent',
    grid: { left: 55, right: 15, top: 60, bottom: 50 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderColor: 'transparent',
      textStyle: { color: '#f9fafb', fontSize: 12 },
      padding: 6,
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
      splitNumber: 20, // 약 20개의 라벨 표시
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#6b7280', fontSize: 11 },
      splitLine: { lineStyle: { color: '#e5e7eb' } },
    },
    legend: {
      bottom: 0,
      icon: 'roundRect',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 10,
      textStyle: { color: '#6b7280', fontSize: 11 },
    },
  };

  /* -------------------- 요청수 -------------------- */
  const requestsOption = {
    ...baseStyle,
    title: {
      text: '요청수',
      left: 'center',
      textStyle: { fontSize: 14, color: '#374151', fontWeight: 600 },
    },
    series: [
      {
        name: '요청수',
        type: 'bar',
        data: chartData.requests,
        barMaxWidth: getBarMaxWidthForTimeAxis(interval),
        itemStyle: {
          color: '#2563eb',
          opacity: 0.65,
          borderRadius: [0, 0, 0, 0],
        },
      },
    ],
  };

  /* -------------------- 에러율 -------------------- */
  const errorRateOption = {
    ...baseStyle,
    title: {
      text: '에러율',
      left: 'center',
      textStyle: { fontSize: 14, color: '#374151', fontWeight: 600 },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderColor: 'transparent',
      textStyle: { color: '#f9fafb', fontSize: 12 },
      padding: 6,
      formatter: (params: unknown) => {
        interface TooltipParam {
          axisValue: string | number;
          color: string;
          seriesName: string;
          value: number[];
        }
        const list = params as TooltipParam[];
        if (!list?.length) return '';

        const timestamp =
          typeof list[0].axisValue === 'number'
            ? list[0].axisValue
            : new Date(list[0].axisValue).getTime();
        const date = new Date(timestamp);
        const formattedDate = date.toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        const header = `<div style="margin-bottom:4px;"><b>${formattedDate}</b></div>`;
        const lines = list
          .map(
            (p) =>
              `<div style="margin:2px 0;"><span style="color:${p.color}">●</span> ${
                p.seriesName
              }: ${p.value[1].toFixed(2)}%</div>`,
          )
          .join('');
        return header + lines;
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        formatter: (value: number) => `${value}%`,
      },
      splitLine: { lineStyle: { color: '#e5e7eb' } },
    },
    series: [
      {
        name: '에러율',
        type: 'bar',
        data: chartData.errorRate,
        barMaxWidth: getBarMaxWidthForTimeAxis(interval),
        itemStyle: {
          color: '#ef4444',
          opacity: 0.7,
          borderRadius: [0, 0, 0, 0],
        },
      },
    ],
  };

  /* -------------------- 레이턴시 -------------------- */
  // 레이턴시 차트 색상 정의 (라벨과 선 동기화)
  const latencyColors = {
    p95: '#dc2626', // 빨강 (더 진한 빨강)
    p90: '#f59e0b', // 주황 (더 진한 주황)
    p50: '#10b981', // 초록 (에메랄드 그린)
  };

  const latencyOption = {
    ...baseStyle,
    title: {
      text: '레이턴시',
      left: 'center',
      textStyle: { fontSize: 14, color: '#374151', fontWeight: 600 },
    },
    grid: { left: 55, right: 15, top: 60, bottom: 60 },
    yAxis: {
      type: 'value',
      name: 'Milliseconds',
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { color: '#6b7280', fontSize: 12 },
      axisLabel: { color: '#6b7280', fontSize: 11 },
      splitLine: { lineStyle: { color: '#e5e7eb' } },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderColor: 'transparent',
      textStyle: { color: '#f9fafb', fontSize: 12 },
      padding: 6,
      formatter: (params: unknown) => {
        interface TooltipParam {
          axisValue: string | number;
          color: string;
          seriesName: string;
          value: number[];
        }
        const list = params as TooltipParam[];
        if (!list?.length) return '';

        // axisValue가 timestamp인 경우 날짜/시간 형식으로 변환
        const timestamp =
          typeof list[0].axisValue === 'number'
            ? list[0].axisValue
            : new Date(list[0].axisValue).getTime();
        const date = new Date(timestamp);
        const formattedDate = date.toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        const header = `<div style="margin-bottom:4px;"><b>${formattedDate}</b></div>`;
        const lines = list
          .map(
            (p) =>
              `<div style="margin:2px 0;"><span style="color:${p.color}">●</span> ${
                p.seriesName
              }: ${p.value[1].toFixed(2)} ms</div>`,
          )
          .join('');
        return header + lines;
      },
    },
    series: [
      {
        name: 'p95',
        type: 'line',
        data: chartData.latency.p95,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: latencyColors.p95 },
        itemStyle: { color: latencyColors.p95 },
      },
      {
        name: 'p90',
        type: 'line',
        data: chartData.latency.p90,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: latencyColors.p90 },
        itemStyle: { color: latencyColors.p90 },
      },
      {
        name: 'p50',
        type: 'line',
        data: chartData.latency.p50,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: latencyColors.p50 },
        itemStyle: { color: latencyColors.p50 },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">개요</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <StateHandler
            isLoading={isLoading}
            isError={isError}
            isEmpty={isEmpty}
            type="chart"
            height={250}
            loadingMessage="메트릭을 불러오는 중..."
            emptyMessage="표시할 메트릭 데이터가 없습니다"
          >
            <ReactECharts option={requestsOption} style={{ height: 250 }} notMerge={true} />
          </StateHandler>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <StateHandler
            isLoading={isLoading}
            isError={isError}
            isEmpty={isEmpty}
            type="chart"
            height={250}
            loadingMessage="메트릭을 불러오는 중..."
            emptyMessage="표시할 에러율 데이터가 없습니다"
          >
            <ReactECharts option={errorRateOption} style={{ height: 250 }} notMerge={true} />
          </StateHandler>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <StateHandler
            isLoading={isLoading}
            isError={isError}
            isEmpty={isEmpty}
            type="chart"
            height={250}
            loadingMessage="레이턴시 데이터를 불러오는 중..."
            emptyMessage="표시할 레이턴시 데이터가 없습니다"
          >
            <ReactECharts option={latencyOption} style={{ height: 250 }} notMerge={true} />
          </StateHandler>
        </div>
      </div>
    </div>
  );
}
