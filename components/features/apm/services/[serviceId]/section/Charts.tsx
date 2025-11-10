'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface ChartsProps {
  timeRange: string;
}

export default function ChartsSection({ timeRange }: ChartsProps) {
  const [isLoading, setIsLoading] = useState(false);

  // latency의 초기값을 실제 사용하는 구조와 동일하게 맞춤
  const initialLatency = {
    p50: Array(10).fill(0),
    p75: Array(10).fill(0),
    p90: Array(10).fill(0),
    p95: Array(10).fill(0),
    p99: Array(10).fill(0),
    p99_9: Array(10).fill(0),
    max: Array(10).fill(0),
  };

  const [chartData, setChartData] = useState({
    timestamps: generateTimestamps('5m'),
    requests: Array(10).fill(0),
    errors: Array(10).fill(0),
    latency: initialLatency,
  });

  /* ------- API 호출 => 현재 더미 데이터(변경 필요) -------- */
  const fetchChartData = useCallback(async (range: string) => {
    setIsLoading(true);

    await new Promise((res) => setTimeout(res, 400)); // 로딩 딜레이 시뮬레이션

    const timestamps = generateTimestamps(range);
    const rand = (base: number, amp = 2000) =>
      timestamps.map(() => Math.max(0, base + Math.floor((Math.random() - 0.5) * amp)));

    setChartData({
      timestamps,
      requests: rand(25000, 15000),
      errors: rand(10, 10),
      latency: {
        p50: rand(120, 40),
        p75: rand(160, 50),
        p90: rand(220, 60),
        p95: rand(280, 70),
        p99: rand(350, 80),
        p99_9: rand(400, 90),
        max: rand(450, 100),
      },
    });

    setIsLoading(false);
  }, []);

  // 기간 변경 시 데이터 다시 불러오기 (1회만)
  useEffect(() => {
    const loadData = async () => {
      await fetchChartData(timeRange);
    };
    loadData();
  }, [timeRange, fetchChartData]);

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
        const list = params as {
          axisValue: string;
          color: string;
          seriesName: string;
          value: number;
        }[];
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
        name: 'p50',
        type: 'line',
        data: chartData.latency.p50,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#2563eb' },
      },
      {
        name: 'p75',
        type: 'line',
        data: chartData.latency.p75,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#7c3aed' },
      },
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
        name: 'p99',
        type: 'line',
        data: chartData.latency.p99,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#f97316' },
      },
      {
        name: 'p99.9',
        type: 'line',
        data: chartData.latency.p99_9,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#eab308' },
      },
      {
        name: 'Max',
        type: 'line',
        data: chartData.latency.max,
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
function generateTimestamps(range: string): string[] {
  const now = new Date();
  const ts: string[] = [];
  for (let i = 9; i >= 0; i--) {
    const t = new Date(now);
    if (['5m', '30m', '1h'].includes(range)) t.setSeconds(now.getSeconds() - i * 10);
    else if (['1d', '1w'].includes(range)) t.setHours(now.getHours() - i * 3);
    else t.setDate(now.getDate() - i * 4);
    ts.push(formatDateLabel(t, range));
  }
  return ts;
}

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
