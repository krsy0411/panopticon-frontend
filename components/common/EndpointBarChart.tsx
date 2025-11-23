'use client';

import dynamic from 'next/dynamic';
import React, { useMemo } from 'react';
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface EndpointItem {
  endpoint_name: string;
  request_count?: number;
  latency_p95_ms?: number;
  error_rate?: number;
  color?: string; // Pie와 동일 색
}

interface Props {
  items: EndpointItem[];
  selectedMetric: 'requests' | 'error_rate' | 'latency';
  height?: number;
  onBarClick?: (endpointName: string) => void;
  colors?: string[];
  allItems?: EndpointItem[]; // 평균 계산용 전체 데이터
}

export default function EndpointBarChart({
  items,
  selectedMetric,
  height = 350,
  onBarClick,
  colors,
  allItems,
}: Props) {
  const option = useMemo(() => {
    if (!items?.length) return null;

    const palette = colors?.length ? colors : undefined;
    const isErrorRate = selectedMetric === 'error_rate';

    // 메트릭별 기본 값 만들기 (요청, p95, 에러율 %)
    const baseValues = items.map((ep) => {
      if (selectedMetric === 'requests') return ep.request_count ?? 0;
      if (selectedMetric === 'latency') return Number((ep.latency_p95_ms ?? 0).toFixed(2));
      return Number(((ep.error_rate ?? 0) * 100).toFixed(2));
    });

    // 합계 (모든 메트릭 공통, Pie와 동일한 비중 계산)
    const totalBase = baseValues.reduce((sum, v) => sum + v, 0);

    // 에러율일 경우 Pie와 동일하게 전체 대비 퍼센트로 환산
    const values = items.map((ep, idx) => {
      const raw = baseValues[idx] ?? 0;
      const value =
        isErrorRate && totalBase > 0 ? Number(((raw / totalBase) * 100).toFixed(2)) : raw;

      return {
        name: ep.endpoint_name,
        value,
        itemStyle: {
          color: ep.color ?? palette?.[idx % palette.length],
        },
      };
    });

    // 평균값 계산 (allItems 있을 경우 전체 데이터 기준, 없으면 현재 데이터 기준)
    const dataForAverage = allItems?.length ? allItems : items;
    let averageValue = 0;

    if (selectedMetric === 'requests') {
      const validItems = dataForAverage.filter((ep) => ep.request_count !== undefined);
      averageValue =
        validItems.length > 0
          ? validItems.reduce((sum, ep) => sum + (ep.request_count ?? 0), 0) / validItems.length
          : 0;
    } else if (selectedMetric === 'latency') {
      const validItems = dataForAverage.filter((ep) => ep.latency_p95_ms !== undefined);
      averageValue =
        validItems.length > 0
          ? validItems.reduce((sum, ep) => sum + (ep.latency_p95_ms ?? 0), 0) / validItems.length
          : 0;
    } else if (selectedMetric === 'error_rate') {
      const validItems = dataForAverage.filter((ep) => ep.error_rate !== undefined);
      averageValue =
        validItems.length > 0
          ? (validItems.reduce((sum, ep) => sum + (ep.error_rate ?? 0), 0) / validItems.length) *
            100
          : 0;
    }

    // y축 범위 자동 확장(에러율)
    const maxValue = Math.max(...values.map((v) => v.value));
    const dynamicMax = isErrorRate ? Math.ceil(maxValue * 1.2) : undefined;

    // ECharts 옵션 구성(축, 라벨, 색상)
    return {
      backgroundColor: 'transparent',

      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderColor: 'transparent',
        textStyle: { color: '#f9fafb', fontSize: 12 },
        padding: 10,

        // 호버: 선택된 엔드포인트 정보 또는 평균선 정보 표시
        formatter: (params: { name?: string; dataIndex?: number }) => {
          // markLine 호버 시
          if (params?.name === '평균') {
            const metricLabel =
              selectedMetric === 'requests'
                ? '요청수'
                : selectedMetric === 'error_rate'
                ? '에러율'
                : '지연시간';

            const metricValue = (() => {
              if (selectedMetric === 'error_rate') return `${averageValue.toFixed(2)}%`;
              if (selectedMetric === 'latency') return `${averageValue.toFixed(2)}ms`;
              return Number(averageValue).toLocaleString();
            })();

            return `
              <div style="font-weight:700;margin-bottom:6px;font-size:14px;">평균</div>
              <div>${metricLabel}: ${metricValue}</div>
            `;
          }

          // 막대 호버 시
          const name = params.name ?? '';
          const idx = params.dataIndex ?? items.findIndex((i) => i.endpoint_name === name);
          const ep = idx >= 0 ? (items[idx] as EndpointItem | undefined) : undefined;
          const p95 = ep?.latency_p95_ms ?? 0;
          const errorRate =
            ep?.error_rate !== undefined && ep?.error_rate !== null ? ep.error_rate * 100 : null;
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

          return `
            <div style="font-weight:700;margin-bottom:6px;font-size:14px;">${name}</div>
            <div>${mainMetricLabel}: ${mainMetricValue}</div>
            <div>지연시간(P95): ${p95.toFixed(2)} ms</div>
            <div>에러율: ${errorRateText}</div>
          `;
        },
      },

      grid: { left: 40, right: 20, top: 30, bottom: 100 },

      xAxis: {
        type: 'category',
        data: items.map((i) => i.endpoint_name),
        axisLabel: {
          // always show every label so middle items do not disappear on narrow charts
          interval: 0,
          color: '#374151',
          fontSize: 9,
          margin: 12,
        },
        axisTick: {
          alignWithLabel: true,
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

      // 막대 그래프 렌더링
      series: [
        {
          type: 'bar',
          barWidth: '45%',
          data: values,
          label: {
            show: true,
            position: 'top',
            formatter: (p: { value: number }) => {
              if (selectedMetric === 'error_rate') return `${p.value.toFixed(2)}`;
              if (selectedMetric === 'latency') return `${p.value}`;
              return Number(p.value).toLocaleString();
            },
          },
          itemStyle: { borderRadius: [4, 4, 0, 0] },
          markLine: {
            symbol: 'none',
            label: { show: false },
            data: [
              {
                name: '평균',
                yAxis: averageValue,
                lineStyle: {
                  type: 'dashed',
                  color: 'rgba(100, 100, 100, 0.7)',
                  width: 2,
                },
              },
            ],
          },
        },
      ],
    };
  }, [items, selectedMetric, colors, allItems]);

  // 클릭 이벤트 전달 (평균선 클릭 무시)
  const events = {
    click: (params: { name?: string; componentSubType?: string }) => {
      // 평균선(markLine) 클릭 시 이벤트 무시
      if (params?.name === '평균' || params?.componentSubType === 'markLine') return;
      if (params?.name && onBarClick) onBarClick(params.name);
    },
  };

  return <ReactECharts option={option} style={{ height }} onEvents={events} />;
}
