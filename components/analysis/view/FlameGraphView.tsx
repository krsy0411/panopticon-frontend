/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { SpanItem } from '@/types/apm';
import { useMemo } from 'react';
import { getBucketColor, getBucketLabel, getBucketByIndex } from '@/src/utils/durationBuckets';
import dynamic from 'next/dynamic';
import StateHandler from '@/components/ui/StateHandler';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface FlameGraphViewProps {
  spans: SpanItem[];
  onSpanSelect?: (spanId: string) => void;
  height?: string | number;
}

interface FlameBlock {
  span: SpanItem;
  depth: number;
  startOffset: number;
  widthRatio: number;
}

export default function FlameGraphView({
  spans,
  onSpanSelect,
  height = '500px',
}: FlameGraphViewProps) {
  // 스팬을 Flame Graph 블록으로 변환
  const { flameBlocks, maxDepth } = useMemo(() => {
    if (!spans || spans.length === 0) return { flameBlocks: [], maxDepth: 0 };

    // 루트 스팬 찾기
    const rootSpan = spans.find((s) => !s.parent_span_id);
    if (!rootSpan) {
      return { flameBlocks: [], maxDepth: 0 };
    }

    // 모든 스팬 ID 목록 생성
    const spanIds = new Set(spans.map((s) => s.span_id));

    const blocks: FlameBlock[] = [];
    let maxDepthFound = 0;

    // 전체 트레이스의 시작 시간과 종료 시간 계산
    const allStartTimes = spans.map((s) => new Date(s.timestamp).getTime());
    const allEndTimes = spans.map((s) => new Date(s.timestamp).getTime() + s.duration_ms);

    const traceStartTime = Math.min(...allStartTimes);
    const traceEndTime = Math.max(...allEndTimes);
    const traceDuration = traceEndTime - traceStartTime;

    // 재귀적으로 블록 생성
    const buildBlocks = (span: SpanItem, depth: number) => {
      maxDepthFound = Math.max(maxDepthFound, depth);

      const spanStartTime = new Date(span.timestamp).getTime();
      const spanDuration = span.duration_ms;

      const startOffset = (spanStartTime - traceStartTime) / traceDuration;
      const widthRatio = spanDuration / traceDuration;

      const block: FlameBlock = {
        span,
        depth,
        startOffset,
        widthRatio,
      };

      blocks.push(block);

      const directChildren = spans.filter((s) => s.parent_span_id === span.span_id);

      const adoptedChildren =
        span.span_id === rootSpan.span_id
          ? spans.filter((s) => s.parent_span_id && !spanIds.has(s.parent_span_id))
          : [];

      const children = [...directChildren, ...adoptedChildren];

      children.forEach((child) => {
        buildBlocks(child, depth + 1);
      });
    };

    buildBlocks(rootSpan, 0);

    return {
      flameBlocks: blocks,
      maxDepth: maxDepthFound,
    };
  }, [spans]);

  const option = useMemo(() => {
    if (flameBlocks.length === 0) return {};

    const allStartTimes = spans.map((s) => new Date(s.timestamp).getTime());
    const allEndTimes = spans.map((s) => new Date(s.timestamp).getTime() + s.duration_ms);
    const traceStartTime = Math.min(...allStartTimes);
    const traceEndTime = Math.max(...allEndTimes);
    const totalDuration = traceEndTime - traceStartTime;

    const seriesData = flameBlocks.map((block) => {
      const ratio = (block.span.duration_ms ?? 0) / Math.max(1, totalDuration);
      const color = getBucketColor(ratio);
      return {
        value: [
          block.startOffset * totalDuration,
          block.depth,
          (block.startOffset + block.widthRatio) * totalDuration,
          block.span.duration_ms,
        ],
        itemStyle: { color },
        spanData: block.span,
      };
    });

    const blockHeight = 35;

    return {
      grid: {
        left: 10,
        right: 10,
        top: 0,
        bottom: 10,
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderColor: 'transparent',
        textStyle: { color: '#f9fafb', fontSize: 28 },
        formatter: (params: any) => {
          const data = params.data.spanData;
          const ratio =
            (data.duration_ms ?? 0) /
            Math.max(1, spans.find((s) => !s.parent_span_id)?.duration_ms || 1);
          const statusText = getBucketLabel(ratio);
          return `
            <div style="font-weight:700;margin-bottom:6px;font-size:24px;line-height:1.2;">${
              data.name
            }</div>
            <div style="line-height:1.2;font-size:20px;">총 시간: ${data.duration_ms.toFixed(
              2,
            )}ms</div>
            <div style="line-height:1.2;font-size:20px;">서비스: ${data.service_name}</div>
            <div style="line-height:1.2;font-size:20px;">종류: ${data.kind}</div>
            <div style="line-height:1.2;font-size:20px;">상태: ${statusText}</div>
            ${
              data.http_method
                ? `<div style="line-height:1.2;font-size:20px;">HTTP: ${data.http_method} ${
                    data.http_path || ''
                  }</div>`
                : ''
            }
            ${
              data.db_statement
                ? `<div style="line-height:1.2;font-size:20px;">DB: ${data.db_statement.substring(
                    0,
                    50,
                  )}...</div>`
                : ''
            }
          `;
        },
      },
      xAxis: {
        type: 'value',
        name: 'Time (ms)',
        nameLocation: 'middle',
        nameGap: 25,
        min: 0,
        max: totalDuration,
        axisLabel: {
          formatter: '{value}ms',
          color: '#6b7280',
          fontSize: 11,
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: (maxDepth + 1) * (blockHeight + 0),
        inverse: false,
        show: false,
      },
      series: [
        {
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const depth = api.value(1);
            const xStart = api.coord([api.value(0), 0])[0];
            const xEnd = api.coord([api.value(2), 0])[0];
            const y = depth * (blockHeight + 0);
            const width = Math.max(xEnd - xStart, 1);

            const rectShape = {
              x: xStart,
              y: y,
              width: width,
              height: blockHeight,
            };

            const dataItem = seriesData[params.dataIndex];
            if (!dataItem || !dataItem.spanData) {
              return {
                type: 'rect',
                shape: rectShape,
                style: api.style(),
              };
            }

            const spanData = dataItem.spanData;

            return {
              type: 'group',
              children: [
                {
                  type: 'rect',
                  shape: rectShape,
                  style: api.style(),
                },
                {
                  type: 'text',
                  style: {
                    x: xStart + width / 2,
                    y: y + blockHeight / 2,
                    text: spanData.name,
                    fill: '#000000',
                    fontSize: 12,
                    fontWeight: 700,
                    textAlign: 'center',
                    textVerticalAlign: 'middle',
                    overflow: 'truncate',
                    width: width - 8,
                  },
                },
              ],
            };
          },
          encode: {
            x: [0, 2],
            y: 1,
          },
          data: seriesData,
        },
      ],
    };
  }, [flameBlocks, maxDepth, spans]);

  const onChartClick = (params: any) => {
    if (params.data && params.data.spanData && onSpanSelect) {
      onSpanSelect(params.data.spanData.span_id);
    }
  };

  return (
    <StateHandler isEmpty={flameBlocks.length === 0} type="chart" height={height}>
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

        <div className="flex-1 bg-linear-to-br from-slate-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm overflow-hidden p-4">
          <ReactECharts
            option={option}
            style={{ height: `${Math.max(300, (maxDepth + 1) * 50)}px`, width: '100%' }}
            onEvents={{ click: onChartClick }}
          />
        </div>
      </div>
    </StateHandler>
  );
}
