/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import dynamic from 'next/dynamic';
import React, { useMemo } from 'react';
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface EndpointItem {
  endpoint_name: string;
  request_count?: number;
  latency_p95_ms?: number;
  error_rate?: number;
  color?: string; // Resources에서 넣어주는 색
}

interface Props {
  items: EndpointItem[];
  selectedMetric: 'requests' | 'error_rate' | 'latency';
  height?: number;
  onSliceClick?: (endpointName: string) => void;
  showLegend?: boolean;
  colors?: string[]; // 팔레트 주입 (없으면 ECharts 기본 팔레트)
}

export default function EndpointPieChart({
  items,
  selectedMetric,
  height = 350,
  onSliceClick,
  showLegend = false,
  colors,
}: Props) {
  const pieOption = useMemo(() => {
    const defaultColors = ['#537FE7', '#5BC0BE', '#FFB562', '#F472B6', '#A78BFA'];
    const palette = colors && colors.length > 0 ? colors : defaultColors;

    const pieData = (items || []).map((ep, idx) => {
      let value: number = ep.request_count ?? 0;
      if (selectedMetric === 'error_rate') value = (ep.error_rate ?? 0) * 100;
      if (selectedMetric === 'latency') value = ep.latency_p95_ms ?? 0;
      const itemColor = ep.color || palette[idx % palette.length];
      return {
        name: ep.endpoint_name,
        value,
        endpointData: ep,
        itemStyle: {
          color: itemColor,
        },
      };
    });

    return {
      backgroundColor: 'transparent',
      color: palette,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderColor: 'transparent',
        textStyle: { color: '#f9fafb', fontSize: 12 },
        padding: 10,
        formatter: (params: any) => {
          const d = params.data?.endpointData || params.data || {};
          const name = params.name || d.endpoint_name || '';
          const requests = d.request_count ?? params.value ?? 0;
          const p95 = d.latency_p95_ms ?? d.p95 ?? 0;
          const errorRate =
            d.error_rate !== undefined && d.error_rate !== null ? d.error_rate * 100 : null;

          const mainMetricLabel =
            selectedMetric === 'requests'
              ? '요청수'
              : selectedMetric === 'error_rate'
              ? '에러율'
              : '지연시간';
          const mainMetricValue =
            selectedMetric === 'requests'
              ? requests.toLocaleString()
              : selectedMetric === 'error_rate'
              ? `${((d.error_rate ?? 0) * 100).toFixed(2)}%`
              : `${p95.toFixed(2)} ms`;

          const errorRateText = errorRate !== null ? `${errorRate.toFixed(2)}%` : '-';

          return `
            <div style="font-weight:700;margin-bottom:6px;font-size:14px;">${name}</div>
            <div style="margin:4px 0;font-size:12px;">${mainMetricLabel}: ${mainMetricValue}</div>
            <div style="margin:4px 0;font-size:12px;">지연시간(p95): ${p95.toFixed(2)} ms</div>
            <div style="margin:4px 0;font-size:12px;">에러율 ${errorRateText}</div>
          `;
        },
      },
      legend: showLegend
        ? {
            orient: 'horizontal',
            bottom: 0,
            data: items.map((e) => e.endpoint_name),
            textStyle: { fontSize: 11, color: '#6b7280' },
            type: 'scroll',
          }
        : { show: false },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          data: pieData,
          label: {
            show: true,
            formatter: (params: any) => {
              const ep = params.data?.endpointData || params.data || {};
              if (selectedMetric === 'requests') {
                return `${(ep.request_count ?? 0).toLocaleString()}`;
              } else if (selectedMetric === 'error_rate') {
                return `${((ep.error_rate ?? 0) * 100).toFixed(2)}%`;
              } else if (selectedMetric === 'latency') {
                return `${(ep.latency_p95_ms ?? 0).toFixed(2)}ms`;
              }
              return '{d}%';
            },
          },

          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    } as any;
  }, [items, selectedMetric, showLegend, colors]);

  const events = {
    click: (params: any) => {
      const endpointName = params?.name || params?.data?.endpointData?.endpoint_name;
      if (endpointName && onSliceClick) onSliceClick(endpointName);
    },
  } as any;

  return <ReactECharts option={pieOption} style={{ height }} onEvents={events} />;
}
