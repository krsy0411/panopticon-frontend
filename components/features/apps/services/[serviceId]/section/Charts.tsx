'use client';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { getServiceMetrics } from '@/src/api/apm';
import { useTimeRangeStore } from '@/src/store/timeRangeStore';
import { formatChartTimeLabel, getBarWidth } from '@/src/utils/chartFormatter';
import StateHandler from '@/components/ui/StateHandler';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface ChartsProps {
  serviceName: string;
}

export default function ChartsSection({ serviceName }: ChartsProps) {
  // Zustand store에서 시간 정보 가져오기
  const { startTime, endTime, interval } = useTimeRangeStore();

  // API 데이터 가져오기
  const { data, isLoading, isError } = useQuery({
    queryKey: ['serviceMetrics', serviceName, startTime, endTime, interval],
    queryFn: () =>
      getServiceMetrics(serviceName, {
        from: startTime,
        to: endTime,
        interval: interval,
        environment: 'prod',
      }),
    retry: false, // API 오류 시 재시도 하지 않음
    throwOnError: false, // 오류를 throw하지 않고 isError 상태로만 처리
  });

  // 차트 데이터 변환 (새로운 API 응답 형식: 배열 또는 단일 객체)
  const metricsArray = Array.isArray(data) ? data : data ? [data] : [];

  // 데이터 없음 체크
  const isEmpty = metricsArray.length === 0 || !metricsArray[0]?.points.length;

  const chartData = {
    timestamps:
      metricsArray[0]?.points.map((item) =>
        formatChartTimeLabel(new Date(item.timestamp), interval),
      ) || [],
    requests:
      metricsArray
        .find((m) => m.metric_name === 'http_requests_total')
        ?.points.map((p) => p.value) || [],
    errors:
      metricsArray.find((m) => m.metric_name === 'error_rate')?.points.map((p) => p.value * 100) ||
      [],
    latency: {
      p95:
        metricsArray.find((m) => m.metric_name === 'latency_p95_ms')?.points.map((p) => p.value) ||
        [],
      // 추후 다른 레이턴시 퍼센타일도 추가 가능
    },
  };

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
      type: 'category',
      data: chartData.timestamps,
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        interval: 'auto',
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
  };

  /* -------------------- Requests & Errors -------------------- */
  const requestsOption = {
    ...baseStyle,
    title: {
      text: 'Requests & Errors',
      left: 'center',
      textStyle: { fontSize: 14, color: '#374151', fontWeight: 600 },
    },
    series: [
      {
        name: 'Requests',
        type: 'bar',
        data: chartData.requests,
        barWidth: getBarWidth(interval),
        itemStyle: {
          color: '#2563eb',
          opacity: 0.65,
          borderRadius: [0, 0, 0, 0],
        },
      },
      {
        name: 'Errors',
        type: 'bar',
        data: chartData.errors,
        barWidth: getBarWidth(interval),
        itemStyle: {
          color: '#ef4444',
          opacity: 0.65,
          borderRadius: [0, 0, 0, 0],
        },
      },
    ],
  };

  /* -------------------- Errors -------------------- */
  const errorsOption = {
    ...baseStyle,
    title: {
      text: 'Errors',
      left: 'center',
      textStyle: { fontSize: 14, color: '#374151', fontWeight: 600 },
    },
    series: [
      {
        name: 'Errors',
        type: 'bar',
        data: chartData.errors,
        barWidth: getBarWidth(interval),
        itemStyle: {
          color: '#ef4444',
          opacity: 0.7,
          borderRadius: [0, 0, 0, 0],
        },
      },
    ],
  };

  /* -------------------- Latency -------------------- */
  const latencyOption = {
    ...baseStyle,
    title: {
      text: 'Latency',
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
          axisValue: string;
          color: string;
          seriesName: string;
          value: number;
        }
        const list = params as TooltipParam[];
        if (!list?.length) return '';
        const header = `<div style="margin-bottom:4px;"><b>${list[0].axisValue}</b></div>`;
        const lines = list
          .map(
            (p) =>
              `<div style="margin:2px 0;"><span style="color:${p.color}">●</span> ${p.seriesName}: ${p.value} ms</div>`,
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
        lineStyle: { width: 2, color: '#facc15' },
      },
    ],
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <StateHandler
            isLoading={isLoading}
            isError={isError}
            isEmpty={isEmpty}
            type="chart"
            height={300}
            loadingMessage="메트릭을 불러오는 중..."
            emptyMessage="표시할 메트릭 데이터가 없습니다"
          >
            <ReactECharts option={requestsOption} style={{ height: 300 }} />
          </StateHandler>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <StateHandler
            isLoading={isLoading}
            isError={isError}
            isEmpty={isEmpty}
            type="chart"
            height={300}
            loadingMessage="메트릭을 불러오는 중..."
            emptyMessage="표시할 에러 데이터가 없습니다"
          >
            <ReactECharts option={errorsOption} style={{ height: 300 }} />
          </StateHandler>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <StateHandler
          isLoading={isLoading}
          isError={isError}
          isEmpty={isEmpty}
          type="chart"
          height={340}
          loadingMessage="레이턴시 데이터를 불러오는 중..."
          emptyMessage="표시할 레이턴시 데이터가 없습니다"
        >
          <ReactECharts option={latencyOption} style={{ height: 340 }} />
        </StateHandler>
      </div>
    </>
  );
}
