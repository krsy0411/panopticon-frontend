/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import dynamic from 'next/dynamic';
import React, { useMemo } from 'react';
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

// 파이차트용 5색 gradient (더 뚜렷한 차이)
const PIE_CHART_COLORS = [
  '#0D47A1', // 1순위: 진한 파란색
  '#1565C0', // 2순위
  '#2196F3', // 3순위: 표준 파란색
  '#64B5F6', // 4순위
  '#BBDEFB', // 5순위: 연한 파란색
];

interface EndpointItem {
  endpoint_name: string;
  request_count?: number;
  latency_p95_ms?: number;
  error_rate?: number;
}

interface Props {
  items: EndpointItem[];
  selectedMetric: 'requests' | 'error_rate' | 'latency';
  height?: number;
  onSliceClick?: (endpointName: string) => void;
  colors?: string[]; // 팔레트 주입 (없으면 ECharts 기본 팔레트)
}

export default function EndpointPieChart({
  items,
  selectedMetric,
  height = 350,
  onSliceClick,
  colors,
}: Props) {
  const pieOption = useMemo(() => {
    const palette = colors && colors.length > 0 ? colors : PIE_CHART_COLORS;

    const pieData = (items || []).map((ep, idx) => {
      let value: number = ep.request_count ?? 0;
      if (selectedMetric === 'error_rate') value = (ep.error_rate ?? 0) * 100;
      if (selectedMetric === 'latency') value = ep.latency_p95_ms ?? 0;
      const itemColor = palette[idx % palette.length];
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
        textStyle: { color: '#f9fafb', fontSize: 32 },
        padding: 12,
        confine: true,
        formatter: (params: any) => {
          const d = params.data?.endpointData || params.data || {};
          const name = params.name || d.endpoint_name || '';
          const requests = d.request_count ?? params.value ?? 0;
          const p95 = d.latency_p95_ms ?? d.p95 ?? 0;
          const errorRate =
            d.error_rate !== undefined && d.error_rate !== null ? d.error_rate * 100 : null;

          const errorRateText = errorRate !== null ? `${errorRate.toFixed(2)}%` : '-';
          const requestsText = requests.toLocaleString();

          // 슬라이스 색상 가져오기
          const itemColor = params.data?.itemStyle?.color || params.color || '#537FE7';

          return `
            <div style="font-weight:700;margin-bottom:6px;font-size:24px;line-height:1.2;color:${itemColor};">${name}</div>
            <div style="line-height:1.2;font-size:20px;">요청수: ${requestsText}</div>
            <div style="line-height:1.2;font-size:20px;">에러율: ${errorRateText}</div>
            <div style="line-height:1.2;font-size:20px;">지연시간: ${p95.toFixed(2)} ms</div>
          `;
        },
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        data: items.map((e) => e.endpoint_name),
        textStyle: { fontSize: 11, color: '#6b7280' },
        type: 'plain',
        itemGap: 16,
        itemWidth: 10,
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '40%'],
          data: pieData,
          label: {
            show: false,
          },
          labelLine: {
            show: false,
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
  }, [items, selectedMetric, colors]);

  const events = {
    click: (params: any) => {
      const endpointName = params?.name || params?.data?.endpointData?.endpoint_name;
      if (endpointName && onSliceClick) onSliceClick(endpointName);
    },
  } as any;

  return <ReactECharts option={pieOption} style={{ height }} onEvents={events} />;
}
