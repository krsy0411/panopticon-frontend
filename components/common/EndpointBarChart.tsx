'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

// 차트 색상 팔레트 (7개 엔드포인트용)
const DEFAULT_COLORS = [
  '#537FE7',
  '#5BC0BE',
  '#FFB562',
  '#F472B6',
  '#A78BFA',
  '#EC4899',
  '#6366F1',
];

interface EndpointItem {
  endpoint_name: string;
  request_count?: number;
  latency_p95_ms?: number;
  error_rate?: number;
}

interface Props {
  items: EndpointItem[]; // 상위 7개 엔드포인트 데이터
  selectedMetric: 'requests' | 'error_rate' | 'latency';
  height?: number;
  onBarClick?: (endpointName: string) => void;
}

export default function EndpointBarChart({
  items,
  selectedMetric,
  height = 350,
  onBarClick,
}: Props) {
  // 색상 추가 (각 엔드포인트마다 고유한 색상)
  const itemsWithColors = useMemo(() => {
    return items.map((ep, idx) => ({
      ...ep,
      color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
    }));
  }, [items]);

  const option = useMemo(() => {
    if (!itemsWithColors?.length) return null;

    const isErrorRate = selectedMetric === 'error_rate';

    // 메트릭별 기본 값 만들기 (요청수, P95 지연시간, 에러율 %)
    const baseValues = itemsWithColors.map((ep) => {
      if (selectedMetric === 'requests') return ep.request_count ?? 0;
      if (selectedMetric === 'latency') return Number((ep.latency_p95_ms ?? 0).toFixed(2));
      return Number(((ep.error_rate ?? 0) * 100).toFixed(2));
    });

    // 합계 (모든 메트릭 공통)
    const totalBase = baseValues.reduce((sum, v) => sum + v, 0);

    // 에러율일 경우 전체 대비 퍼센트로 환산
    const values = itemsWithColors.map((ep, idx) => {
      const raw = baseValues[idx] ?? 0;
      const value =
        isErrorRate && totalBase > 0 ? Number(((raw / totalBase) * 100).toFixed(2)) : raw;

      return {
        name: ep.endpoint_name,
        value,
        itemStyle: {
          color: ep.color,
        },
      };
    });

    // y축 범위 자동 확장 (에러율)
    const maxValue = Math.max(...values.map((v) => v.value));
    const dynamicMax = isErrorRate ? Math.ceil(maxValue * 1.2) : undefined;

    // ECharts 옵션 구성
    return {
      backgroundColor: 'transparent',

      legend: {
        show: false,
      },

      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderColor: 'transparent',
        textStyle: { color: '#f9fafb', fontSize: 32 },
        padding: 12,

        formatter: (params: { name?: string; dataIndex?: number }) => {
          const name = params.name ?? '';
          const idx =
            params.dataIndex ?? itemsWithColors.findIndex((i) => i.endpoint_name === name);
          const ep = idx >= 0 ? itemsWithColors[idx] : undefined;

          if (!ep) return '';

          const p95 = ep.latency_p95_ms ?? 0;
          const errorRate =
            ep.error_rate !== undefined && ep.error_rate !== null ? ep.error_rate * 100 : null;
          const sharePercent =
            totalBase > 0 && idx >= 0
              ? Number(((baseValues[idx] / totalBase) * 100).toFixed(2))
              : 0;

          const mainMetricLabel =
            selectedMetric === 'requests'
              ? '요청수'
              : selectedMetric === 'error_rate'
              ? '에러율'
              : '지연시간';

          const mainMetricValue =
            selectedMetric === 'requests'
              ? `${sharePercent.toFixed(2)}%`
              : selectedMetric === 'error_rate'
              ? `${sharePercent.toFixed(2)}%`
              : `${sharePercent.toFixed(2)}%`;

          const errorRateText = errorRate !== null ? `${errorRate.toFixed(2)}%` : '-';
          const barColor = values[idx]?.itemStyle.color ?? '#fff';

          return `
            <div style="font-weight:700;margin-bottom:6px;font-size:24px;line-height:1.2;color:${barColor};">${name}</div>
            <div style="line-height:1.2;font-size:20px;">${mainMetricLabel}: ${mainMetricValue}</div>
            <div style="line-height:1.2;font-size:20px;">지연시간(P95): ${p95.toFixed(2)} ms</div>
            <div style="line-height:1.2;font-size:20px;">에러율: ${errorRateText}</div>
          `;
        },
      },

      grid: { left: 50, right: 20, top: 30, bottom: 100 },

      xAxis: {
        type: 'category',
        data: itemsWithColors.map((i) => i.endpoint_name),
        axisLabel: {
          show: false,
        },
        axisTick: {
          show: false,
        },
      },

      yAxis: {
        type: 'value',
        max: dynamicMax,
        axisLabel: {
          formatter: (val: number) =>
            selectedMetric === 'error_rate'
              ? `${val}%`
              : selectedMetric === 'latency'
              ? `${val}ms`
              : val.toLocaleString(),
        },
      },

      // 막대 그래프 렌더링 (단일 series)
      series: [
        {
          type: 'bar',
          name: 'metrics',
          data: values.map((val) => ({
            value: val.value,
            name: val.name,
            itemStyle: {
              color: val.itemStyle.color,
              borderRadius: [4, 4, 0, 0],
            },
          })),
          label: {
            show: true,
            position: 'top',
            formatter: (p: { value: number }) => {
              if (selectedMetric === 'error_rate') return `${p.value.toFixed(2)}%`;
              if (selectedMetric === 'latency') return `${p.value} ms`;
              return Number(p.value).toLocaleString();
            },
          },
          barWidth: '60%',
        },
      ],
    };
  }, [itemsWithColors, selectedMetric]);

  // 클릭 이벤트 전달
  const events = {
    click: (params: { name?: string }) => {
      if (params?.name && onBarClick) onBarClick(params.name);
    },
  };

  return <ReactECharts option={option} style={{ height }} onEvents={events} />;
}
