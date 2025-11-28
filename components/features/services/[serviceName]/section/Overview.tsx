'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import OverviewCharts from '@/components/features/services/[serviceName]/OverviewCharts';
import { getServiceMetrics } from '@/src/api/apm';
import { POLLING_MAIN_INTERVAL, useTimeRangeStore } from '@/src/store/timeRangeStore';
import { convertTimeRangeToParams, getChartXAxisRange } from '@/src/utils/timeRange';
import { getTimeAxisFormatter, getBarMaxWidthForTimeAxis } from '@/src/utils/chartFormatter';
import { useSloMetricsMonitoring } from '@/src/hooks/useSloMetricsMonitoring';

interface OverviewSectionProps {
  serviceName: string;
}

// 레이턴시 차트 색상 정의 (컴포넌트 바깥에서 정의하여 불필요한 재렌더링 방지)
const LATENCY_COLORS = {
  p95: '#dc2626', // 빨강 (더 진한 빨강)
  p90: '#f59e0b', // 주황 (더 진한 주황)
  p50: '#10b981', // 초록 (에메랄드 그린)
};

export default function OverviewSection({ serviceName }: OverviewSectionProps) {
  // SLO 메트릭 모니터링 초기화
  useSloMetricsMonitoring(serviceName);

  // Chart selection and layout moved to `OverviewCharts` component
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
    refetchInterval: POLLING_MAIN_INTERVAL,
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
  const baseStyle = useMemo(
    () => ({
      backgroundColor: 'transparent',
      animation: false, // markLine 애니메이션 비활성화
      grid: { left: 55, right: 15, top: 60, bottom: 50 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderColor: 'transparent',
        textStyle: { color: '#f9fafb', fontSize: 32 },
        padding: 12,
        borderRadius: 8,
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
    }),
    [interval, xAxisMin, xAxisMax],
  );

  /* -------------------- 요청수 -------------------- */
  // 요청수 평균 계산
  const requestsAverage = useMemo(() => {
    const values = chartData.requests.map((p: number[]) => p[1]);
    const validValues = values.filter((v: number) => typeof v === 'number');
    return validValues.length > 0
      ? validValues.reduce((sum: number, v: number) => sum + v, 0) / validValues.length
      : 0;
  }, [chartData.requests]);

  const requestsOption = useMemo(
    () => ({
      ...baseStyle,
      title: {
        text: '요청수',
        left: 'center',
        textStyle: { fontSize: 14, color: '#374151', fontWeight: 600 },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderColor: 'transparent',
        textStyle: { color: '#f9fafb', fontSize: 32 },
        padding: 12,
        borderRadius: 8,
        formatter: (params: unknown) => {
          interface TooltipParam {
            axisValue: string | number;
            color: string;
            seriesName: string;
            value: number[];
          }
          const list = Array.isArray(params) ? params : [params as TooltipParam];
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

          const header = `<div style="margin-bottom:6px;font-size:24px;line-height:1.2;"><b>${formattedDate}</b></div>`;
          const lines = list
            .map(
              (p) =>
                `<div style="line-height:1.2;font-size:20px;"><span style="color:${
                  p.color
                }">●</span> ${p.seriesName}: ${Math.round(p.value[1] ?? 0)}</div>`,
            )
            .join('');
          return header + lines;
        },
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
          markLine: {
            symbol: 'none',
            label: { show: false },
            animationDuration: 0,
            silent: true,
            data: [
              {
                name: '평균',
                yAxis: requestsAverage,
                lineStyle: {
                  type: 'dashed',
                  color: '#1e40af',
                  width: 2,
                },
              },
            ],
          },
        },
      ],
    }),
    [baseStyle, chartData.requests, requestsAverage, interval],
  );

  /* -------------------- 에러율 -------------------- */
  // 에러율 평균 계산
  const errorRateAverage = useMemo(() => {
    const values = chartData.errorRate.map((p: number[]) => p[1]);
    const validValues = values.filter((v: number) => typeof v === 'number');
    return validValues.length > 0
      ? validValues.reduce((sum: number, v: number) => sum + v, 0) / validValues.length
      : 0;
  }, [chartData.errorRate]);

  const errorRateOption = useMemo(
    () => ({
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
        textStyle: { color: '#f9fafb', fontSize: 32 },
        padding: 12,
        borderRadius: 8,
        formatter: (params: unknown) => {
          interface TooltipParam {
            axisValue: string | number;
            color: string;
            seriesName: string;
            value: number[];
          }
          const list = Array.isArray(params) ? params : [params as TooltipParam];
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

          const header = `<div style="margin-bottom:6px;font-size:24px;line-height:1.2;"><b>${formattedDate}</b></div>`;
          const lines = list
            .map(
              (p) =>
                `<div style="line-height:1.2;font-size:20px;"><span style="color:${
                  p.color
                }">●</span> ${p.seriesName}: ${(p.value[1] ?? 0).toFixed(2)}%</div>`,
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
          markLine: {
            symbol: 'none',
            label: { show: false },
            animationDuration: 0,
            silent: true,
            data: [
              {
                name: '평균',
                yAxis: errorRateAverage,
                lineStyle: {
                  type: 'dashed',
                  color: '#991b1b',
                  width: 2,
                },
              },
            ],
          },
        },
      ],
    }),
    [baseStyle, chartData.errorRate, errorRateAverage, interval],
  );

  /* -------------------- 레이턴시 -------------------- */
  // 레이턴시 평균값 계산 (p95, p90, p50 각각)
  const latencyAverages = useMemo(() => {
    const calculateAverage = (data: number[][]) => {
      const values = data.map((p: number[]) => p[1]);
      const validValues = values.filter((v: number) => typeof v === 'number');
      return validValues.length > 0
        ? validValues.reduce((sum: number, v: number) => sum + v, 0) / validValues.length
        : 0;
    };

    return {
      p95: calculateAverage(chartData.latency.p95),
      p90: calculateAverage(chartData.latency.p90),
      p50: calculateAverage(chartData.latency.p50),
    };
  }, [chartData.latency]);

  const latencyOption = useMemo(
    () => ({
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
        textStyle: { color: '#f9fafb', fontSize: 32 },
        padding: 12,
        borderRadius: 8,
        formatter: (params: unknown) => {
          interface TooltipParam {
            axisValue: string | number;
            color: string;
            seriesName: string;
            value: number[];
          }
          const list = Array.isArray(params) ? params : [params as TooltipParam];
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

          const header = `<div style="margin-bottom:6px;font-size:24px;line-height:1.2;"><b>${formattedDate}</b></div>`;
          const lines = list
            .map(
              (p) =>
                `<div style="line-height:1.2;font-size:20px;"><span style="color:${
                  p.color
                }">●</span> ${p.seriesName}: ${(p.value[1] ?? 0).toFixed(2)}ms</div>`,
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
          symbol: 'circle',
          showSymbol: true,
          symbolSize: 6,
          cursor: 'pointer',
          lineStyle: { width: 2, color: LATENCY_COLORS.p95 },
          itemStyle: { color: LATENCY_COLORS.p95 },
          emphasis: { focus: 'series' },
          markLine: {
            symbol: 'none',
            label: { show: false },
            animationDuration: 0,
            silent: true,
            data: [
              {
                name: 'p95 평균',
                yAxis: latencyAverages.p95,
                lineStyle: {
                  type: 'dashed',
                  color: 'rgba(220, 38, 38, 0.5)',
                  width: 2,
                },
              },
            ],
          },
        },
        {
          name: 'p90',
          type: 'line',
          data: chartData.latency.p90,
          smooth: true,
          symbol: 'circle',
          showSymbol: true,
          symbolSize: 6,
          cursor: 'pointer',
          lineStyle: { width: 2, color: LATENCY_COLORS.p90 },
          itemStyle: { color: LATENCY_COLORS.p90 },
          emphasis: { focus: 'series' },
          markLine: {
            symbol: 'none',
            label: { show: false },
            animationDuration: 0,
            silent: true,
            data: [
              {
                name: 'p90 평균',
                yAxis: latencyAverages.p90,
                lineStyle: {
                  type: 'dashed',
                  color: 'rgba(245, 158, 11, 0.5)',
                  width: 2,
                },
              },
            ],
          },
        },
        {
          name: 'p50',
          type: 'line',
          data: chartData.latency.p50,
          smooth: true,
          symbol: 'circle',
          showSymbol: true,
          symbolSize: 6,
          cursor: 'pointer',
          lineStyle: { width: 2, color: LATENCY_COLORS.p50 },
          itemStyle: { color: LATENCY_COLORS.p50 },
          emphasis: { focus: 'series' },
          markLine: {
            symbol: 'none',
            label: { show: false },
            animationDuration: 0,
            silent: true,
            data: [
              {
                name: 'p50 평균',
                yAxis: latencyAverages.p50,
                lineStyle: {
                  type: 'dashed',
                  color: 'rgba(16, 185, 129, 0.5)',
                  width: 2,
                },
              },
            ],
          },
        },
      ],
    }),
    [baseStyle, chartData.latency, latencyAverages],
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">개요</h2>

      {/* Chart selection and layout handled inside `OverviewCharts` */}
      <OverviewCharts
        requestsOption={requestsOption}
        errorRateOption={errorRateOption}
        latencyOption={latencyOption}
        isLoading={isLoading}
        isError={isError}
        isEmpty={isEmpty}
        chartData={chartData}
        serviceName={serviceName}
      />
    </div>
  );
}
