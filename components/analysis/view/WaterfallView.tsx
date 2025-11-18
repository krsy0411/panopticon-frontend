/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import type { SpanItem } from '@/types/apm';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer,
]);

interface WaterfallViewProps {
  spans: SpanItem[];
  onSpanSelect: (id: string | null) => void;
}

import { getBucketColor, getBucketLabel, getBucketByIndex } from '@/src/utils/durationBuckets';

export default function WaterfallView({ spans, onSpanSelect }: WaterfallViewProps) {
  const chartOption = useMemo<EChartsOption | null>(() => {
    if (!spans || spans.length === 0) return null;

    /*timestamp를 ms로 변환 */
    const spanStarts = spans.map((s) => new Date(s.timestamp).getTime());

    /* trace 시작점 계산 */
    const traceStart = Math.min(...spanStarts);

    /* 각 스팬의 시작 offset 계산 */
    const offsetData = spans.map((s) => {
      const start = new Date(s.timestamp).getTime();
      return start - traceStart; // Waterfall 시작 위치 (ms)
    });

    /*duration 그대로 사용 */
    const durationData = spans.map((s) => s.duration_ms ?? 0);

    const maxDuration = Math.max(...durationData, 1);

    /*duration bar도 itemStyle 포함해서 구성 */
    const durationBar = spans.map((s) => {
      const dur = s.duration_ms ?? 0;
      const ratio = dur / maxDuration;
      return {
        value: dur,
        name: s.name,
        spanId: s.span_id,
        itemStyle: {
          color: getBucketColor(ratio),
        },
      };
    });

    const yAxisData = spans.map((s) => (s.name.length > 25 ? s.name.slice(0, 22) + '...' : s.name));

    return {
      backgroundColor: 'transparent',
      grid: {
        left: '25%',
        right: '15%',
        top: '5%',
        bottom: '5%',
      },

      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff',
          fontSize: 15,
        },
        padding: 16,
        formatter: (params: any) => {
          const spanId = params.data?.spanId;
          const span = spans.find((s) => s.span_id === spanId);
          if (!span) return '';

          const ratio = (span.duration_ms ?? 0) / maxDuration;
          const statusText = getBucketLabel(ratio);

          return `
            <div style="line-height: 1.8;">
              <div style="font-weight: 600; font-size: 16px; margin-bottom: 10px; color: #fff;">
                ${span.name}
              </div>
              <div style="color: #e2e8f0; margin-bottom: 8px; font-size: 15px;">
                Duration:
                <span style="color:#fff;font-weight:600;">
                  ${(span.duration_ms ?? 0).toFixed(2)} ms
                </span>
              </div>
              <div style="color: #e2e8f0; margin-bottom: 6px; font-size: 15px;">
                Status: ${statusText}
              </div>
              <div style="color:#94a3b8;font-size:12px;margin-top:8px;font-family:monospace;">
                ${span.span_id}
              </div>
            </div>
          `;
        },
      },

      /* x축 라벨 Duration → Timeline 으로 변경 */
      xAxis: {
        type: 'value',
        name: 'Timeline (ms)',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: { fontSize: 13, color: '#6b7280' },
        axisLabel: { fontSize: 12, color: '#6b7280' },
        splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
      },

      yAxis: {
        type: 'category',
        data: yAxisData,
        inverse: true,
        axisLabel: { fontSize: 12, color: '#374151', fontWeight: 500 },
        axisLine: { show: true, lineStyle: { color: '#d1d5db' } },
        axisTick: { show: false },
      },

      /*offset + duration을 stack으로 구성 */
      series: [
        {
          /** [1] 투명 offset bar (시작 위치) */
          type: 'bar',
          stack: 'total',
          itemStyle: { color: 'rgba(0,0,0,0)' },
          emphasis: { disabled: true },
          data: offsetData,
        },
        {
          /** [2] duration bar */
          type: 'bar',
          stack: 'total',
          barWidth: '60%',
          data: durationBar,
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(0,0,0,0.3)',
            },
          },
        },
      ],
    };
  }, [spans]);

  if (!spans || spans.length === 0) {
    return <div className="text-sm text-gray-500">표시할 스팬 데이터가 없습니다</div>;
  }

  if (!chartOption) {
    return <div className="text-sm text-gray-500">차트를 생성할 수 없습니다</div>;
  }

  const onEvents = {
    click: (params: any) => {
      if (params.data && params.data.spanId) {
        onSpanSelect(params.data.spanId);
      }
    },
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-end mb-4 px-1">
        <div className="flex items-center gap-3 text-xs text-gray-600">
          {Array.from({ length: 5 }).map((_, i) => {
            const b = getBucketByIndex(i);
            return (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: b.color }}></div>
                <span>{b.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex-1 bg-linear-to-br from-slate-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <ReactEChartsCore
          echarts={echarts}
          option={chartOption}
          onEvents={onEvents}
          style={{ height: '100%', width: '100%', minHeight: '500px' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
    </div>
  );
}
