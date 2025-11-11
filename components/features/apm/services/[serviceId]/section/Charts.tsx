'use client';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { getServiceMetrics } from '@/src/api/apm';
import { useTimeRangeStore } from '@/src/store/timeRangeStore';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface ChartsProps {
  serviceName: string;
}

export default function ChartsSection({ serviceName }: ChartsProps) {
  // Zustand store에서 시간 정보 가져오기
  const { startTime, endTime, interval } = useTimeRangeStore();

  // API 데이터 가져오기
  const { data, isLoading } = useQuery({
    queryKey: ['serviceMetrics', serviceName, startTime, endTime, interval],
    queryFn: () =>
      getServiceMetrics(serviceName, {
        start_time: startTime,
        end_time: endTime,
        interval: interval,
      }),
  });

  // 차트 데이터 변환
  const chartData = {
    timestamps:
      data?.data.latency.map((item) => formatDateLabel(new Date(item.timestamp), interval)) || [],
    requests: data?.data.requests_and_errors.map((item) => item.hits) || [],
    errors: data?.data.requests_and_errors.map((item) => item.errors) || [],
    latency: {
      p90: data?.data.latency.map((item) => item.p90) || [],
      p95: data?.data.latency.map((item) => item.p95) || [],
      p99_9: data?.data.latency.map((item) => item.p99_9) || [],
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
        barWidth: 14,
        itemStyle: {
          color: '#2563eb',
          opacity: 0.65,
          borderRadius: [6, 6, 0, 0],
        },
      },
      {
        name: 'Errors',
        type: 'bar',
        data: chartData.errors,
        barWidth: 14,
        itemStyle: {
          color: '#ef4444',
          opacity: 0.65,
          borderRadius: [6, 6, 0, 0],
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
        barWidth: 18,
        itemStyle: {
          color: '#ef4444',
          opacity: 0.7,
          borderRadius: [6, 6, 0, 0],
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
        name: 'p90',
        type: 'line',
        data: chartData.latency.p90,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#10b981' },
      },
      {
        name: 'p95',
        type: 'line',
        data: chartData.latency.p95,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#facc15' },
      },
      {
        name: 'p99.9',
        type: 'line',
        data: chartData.latency.p99_9,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#ef4444' },
      },
    ],
  };

  if (isLoading) {
    return <div className="text-center text-gray-500 p-10">Loading data...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <ReactECharts option={requestsOption} style={{ height: 300 }} />
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <ReactECharts option={errorsOption} style={{ height: 300 }} />
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <ReactECharts option={latencyOption} style={{ height: 340 }} />
      </div>
    </>
  );
}

/* -------------------------------
   헬퍼 함수
--------------------------------*/
function formatDateLabel(date: Date, range: string): string {
  if (['5m', '30m', '1h'].includes(range)) {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } else {
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  }
}
