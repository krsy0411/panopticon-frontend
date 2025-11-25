/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { GraphChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import type { SpanItem } from '@/types/apm';
import { getBucketColor, getBucketLabel, getBucketByIndex } from '@/src/utils/durationBuckets';
import StateHandler from '@/components/ui/StateHandler';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  GraphChart,
  CanvasRenderer,
]);

interface MapViewProps {
  spans: SpanItem[];
  onSpanSelect: (id: string | null) => void;
  height?: string | number;
}

export default function MapView({ spans, onSpanSelect, height = '600px' }: MapViewProps) {
  const chartOption = useMemo<EChartsOption | null>(() => {
    if (!spans || spans.length === 0) {
      return null;
    }

    // Build span map and children relationships
    const spanById = new Map<string, SpanItem>();
    spans.forEach((s) => spanById.set(s.span_id, s));

    const children = new Map<string | null, SpanItem[]>();
    spans.forEach((s) => {
      const p = s.parent_span_id ?? null;
      if (!children.has(p)) children.set(p, []);
      children.get(p)!.push(s);
    });

    // Find roots
    const roots = spans.filter((s) => !s.parent_span_id || !spanById.has(s.parent_span_id));

    // BFS to assign depth
    const levelMap = new Map<number, SpanItem[]>();
    const queue: Array<{ span: SpanItem; depth: number }> = roots.map((r) => ({
      span: r,
      depth: 0,
    }));
    const seen = new Set<string>();

    while (queue.length) {
      const { span, depth } = queue.shift()!;
      if (seen.has(span.span_id)) continue;
      seen.add(span.span_id);
      if (!levelMap.has(depth)) levelMap.set(depth, []);
      levelMap.get(depth)!.push(span);
      const ch = children.get(span.span_id) || [];
      ch.forEach((c) => queue.push({ span: c, depth: depth + 1 }));
    }

    const levelsArr = Array.from(levelMap.keys())
      .sort((a, b) => a - b)
      .map((k) => levelMap.get(k) || []);

    // Force-directed 레이아웃을 사용하므로 초기 위치만 설정
    // (ECharts가 자동으로 최적 거리를 계산함)
    const positionsMap = new Map<string, { x: number; y: number }>();

    levelsArr.forEach((level, depthIdx) => {
      // 초기 위치: 깊이에 따라 약간의 x 오프셋 제공 (force-directed가 조정할 것)
      const baseX = depthIdx * 100;
      const levelHeight = level.length * 100;
      const startY = -levelHeight / 2;

      level.forEach((s, nodeIdx) => {
        const x = baseX;
        const y = startY + nodeIdx * 100 + 50;
        positionsMap.set(s.span_id, { x, y });
      });
    });

    // Calculate max duration for ratio
    const maxDuration = Math.max(...spans.map((x) => x.duration_ms ?? 0), 1);

    // Build nodes for graph
    const nodes = spans.map((s) => {
      const pos = positionsMap.get(s.span_id) || { x: 0, y: 0 };
      const dur = s.duration_ms ?? 0;
      const ratio = dur / maxDuration;
      const color = getBucketColor(ratio);

      return {
        id: s.span_id,
        name: s.name.length > 15 ? s.name.slice(0, 12) + '...' : s.name,
        x: pos.x,
        y: pos.y,
        value: dur.toFixed(2),
        symbolSize: 100,
        symbol: 'circle',
        itemStyle: {
          color: color,
          borderWidth: 0,
          shadowBlur: 12,
          shadowColor: 'rgba(0, 0, 0, 0.15)',
          shadowOffsetY: 3,
        },
        label: {
          show: true,
          position: 'inside' as any,
          formatter: (params: any) => {
            return `{name|${params.data.name}}\n{value|${params.data.value}ms}`;
          },
          rich: {
            name: {
              fontSize: 11,
              color: '#1f2937',
              fontWeight: 700,
              align: 'center' as const,
            },
            value: {
              fontSize: 10,
              color: '#6b7280',
              padding: [2, 0, 0, 0] as [number, number, number, number],
              fontFamily: 'ui-monospace, monospace',
              align: 'center' as const,
            },
          },
        },
      };
    });

    // Build edges
    const links = spans
      .filter((s) => s.parent_span_id && spanById.has(s.parent_span_id))
      .map((s) => ({
        source: s.parent_span_id!,
        target: s.span_id,
        lineStyle: {
          color: '#000000',
          width: 2,
          curveness: 0.2,
          opacity: 0.4,
        },
        symbol: ['none', 'arrow'],
        symbolSize: 8,
      }));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff',
          fontSize: 28,
        },
        padding: 14,
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            const span = spans.find((s) => s.span_id === params.data.id);
            if (!span) return '';
            const ratio = (span.duration_ms ?? 0) / maxDuration;
            const statusText = getBucketLabel(ratio);
            return `<div style="line-height: 1.2;">
              <div style="font-weight: 700; font-size: 24px; margin-bottom: 6px; color: #fff;line-height:1.2;">${
                span.name
              }</div>
              <div style="color: #e2e8f0; font-size: 20px;line-height:1.2;">총 시간: <span style="color: #fff; font-weight: 600;">${(
                span.duration_ms ?? 0
              ).toFixed(2)} ms</span></div>
              <div style="color: #e2e8f0; font-size: 20px;line-height:1.2;">상태: ${statusText}</div>
              <div style="color: #94a3b8; font-size: 18px; margin-top: 10px; font-family: monospace;">${
                span.span_id
              }</div>
            </div>`;
          }
          if (params.dataType === 'edge') {
            const sourceSpan = spans.find((s) => s.span_id === params.data.source);
            const targetSpan = spans.find((s) => s.span_id === params.data.target);
            if (!sourceSpan || !targetSpan) return '';
            return `<div style="line-height: 1.2;">
              <div style="font-weight: 700; font-size: 24px; margin-bottom: 6px; color: #fff;line-height:1.2;">Dependency</div>
              <div style="color: #e2e8f0; font-size: 20px;line-height:1.2;">
                <span style="color: #a5b4fc; font-weight: 600;">From:</span> ${sourceSpan.name}
              </div>
              <div style="color: #e2e8f0; font-size: 20px;line-height:1.2;">
                <span style="color: #fbbf24; font-weight: 600;">To:</span> ${targetSpan.name}
              </div>
              <div style="color: #94a3b8; font-size: 18px; margin-top: 8px;">
                ${sourceSpan.name} → ${targetSpan.name}
              </div>
            </div>`;
          }
          return '';
        },
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          force: {
            repulsion: 1500,
            gravity: 0.1,
            edgeLength: 150,
            friction: 0.1,
            initLayout: 'circular',
          },
          data: nodes,
          links: links,
          roam: true,
          focusNodeAdjacency: true,
          emphasis: {
            focus: 'adjacency',
            scale: 1.1,
            lineStyle: {
              width: 3,
              opacity: 0.8,
            },
          },
          lineStyle: {
            color: '#000000',
            width: 2,
            curveness: 0.2,
            opacity: 0.4,
          },
          animation: false,
        },
      ],
    };
  }, [spans]);

  const onEvents = {
    click: (params: any) => {
      if (params.dataType === 'node') {
        onSpanSelect(params.data.id);
      }
    },
  };

  return (
    <StateHandler
      isEmpty={!spans || spans.length === 0 || !chartOption}
      type="chart"
      height={height}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-end mb-4 px-1">
          <div className="flex items-center gap-3 text-xs text-gray-600">
            {Array.from({ length: 5 }).map((_, i) => {
              const b = getBucketByIndex(i);
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: b.color }}></div>
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
            style={{ height: '100%', width: '100%', minHeight: '600px' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>
      </div>
    </StateHandler>
  );
}
