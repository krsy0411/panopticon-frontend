/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { SpanItem } from '@/types/apm';
import { useMemo } from 'react';
import { getBucketColor, getBucketLabel, getBucketByIndex } from '@/src/utils/durationBuckets';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface FlameGraphViewProps {
  spans: SpanItem[];
  onSpanSelect?: (spanId: string) => void;
}

interface FlameBlock {
  span: SpanItem;
  depth: number;
  startOffset: number; // 부모 내에서의 상대적 시작 위치 (0~1)
  widthRatio: number; // 부모 대비 너비 비율 (0~1)
}

export default function FlameGraphView({ spans, onSpanSelect }: FlameGraphViewProps) {
  // 스팬을 Flame Graph 블록으로 변환
  const { flameBlocks, maxDepth } = useMemo(() => {
    if (!spans || spans.length === 0) return { flameBlocks: [], maxDepth: 0 };

    // 루트 스팬 찾기
    const rootSpan = spans.find((s) => !s.parent_span_id);
    if (!rootSpan) return { flameBlocks: [], maxDepth: 0 };

    const blocks: FlameBlock[] = [];
    let maxDepthFound = 0;

    // 루트 스팬의 시작 시간과 duration을 기준으로 사용
    const rootStartTime = new Date(rootSpan.timestamp).getTime();
    const rootDuration = rootSpan.duration_ms;

    // 재귀적으로 블록 생성
    const buildBlocks = (span: SpanItem, depth: number) => {
      maxDepthFound = Math.max(maxDepthFound, depth);

      // 스팬의 실제 시작 시간을 기준으로 offset 계산
      const spanStartTime = new Date(span.timestamp).getTime();
      const spanDuration = span.duration_ms;

      // 루트 스팬 기준으로 상대적 위치와 너비 계산
      const startOffset = (spanStartTime - rootStartTime) / rootDuration;
      const widthRatio = spanDuration / rootDuration;

      // 현재 스팬의 블록 추가
      blocks.push({
        span,
        depth,
        startOffset,
        widthRatio,
      });

      // 자식 스팬들 찾기
      const children = spans.filter((s) => s.parent_span_id === span.span_id);

      // 자식들을 재귀적으로 처리
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

  // (removed getColorByStatus helper) - colors assigned directly below using bucket util

  const option = useMemo(() => {
    if (flameBlocks.length === 0) return {};

    // 루트 스팬의 duration을 전체 시간으로 사용
    const rootSpan = spans.find((s) => !s.parent_span_id);
    const totalDuration = rootSpan?.duration_ms || 0;

    // Custom 시리즈 data 생성 (0-totalDuration 범위로 변경)
    const seriesData = flameBlocks.map((block) => {
      const ratio = (block.span.duration_ms ?? 0) / Math.max(1, totalDuration);
      const color = getBucketColor(ratio);
      return {
        value: [
          block.startOffset * totalDuration, // X 시작 위치 (0-totalDuration ms)
          block.depth, // Y 위치 (depth)
          (block.startOffset + block.widthRatio) * totalDuration, // X 끝 위치 (0-totalDuration ms)
          block.span.duration_ms, // duration (tooltip용)
        ],
        itemStyle: { color },
        spanData: block.span,
      };
    });

    const blockHeight = 35; // 블록 높이
    const blockGap = 0; // 블록 간 간격

    return {
      grid: {
        left: 10,
        right: 10,
        top: 40,
        bottom: 10,
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderColor: 'transparent',
        textStyle: { color: '#f9fafb', fontSize: 14 },
        formatter: (params: any) => {
          const data = params.data.spanData;
          const ratio =
            (data.duration_ms ?? 0) /
            Math.max(1, spans.find((s) => !s.parent_span_id)?.duration_ms || 1);
          const statusText = getBucketLabel(ratio);
          return `
            <div style="font-weight:700;margin-bottom:8px;font-size:16px;">${data.name}</div>
            <div style="margin:4px 0;font-size:15px;">Duration: ${data.duration_ms}ms</div>
            <div style="margin:4px 0;font-size:15px;">Service: ${data.service_name}</div>
            <div style="margin:4px 0;font-size:15px;">Kind: ${data.kind}</div>
            <div style="margin:4px 0;font-size:15px;">Status: ${statusText}</div>
            ${
              data.http_method
                ? `<div style="margin:4px 0;font-size:14px;">HTTP: ${data.http_method} ${
                    data.http_path || ''
                  }</div>`
                : ''
            }
            ${
              data.db_statement
                ? `<div style="margin:4px 0;font-size:14px;">DB: ${data.db_statement.substring(
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
        max: (maxDepth + 1) * (blockHeight + blockGap),
        inverse: true, // Y축 반전 (위에서 아래로)
        show: false,
      },
      series: [
        {
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const depth = api.value(1);
            const xStart = api.coord([api.value(0), 0])[0];
            const xEnd = api.coord([api.value(2), 0])[0];
            const y = depth * (blockHeight + blockGap);
            const width = Math.max(xEnd - xStart, 1);

            const rectShape = {
              x: xStart,
              y: y,
              width: width,
              height: blockHeight,
            };

            // dataIndex로 원본 데이터 접근
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
                    fill: '#ffffff',
                    fontSize: 12,
                    fontWeight: 500,
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

  if (flameBlocks.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>트레이스 데이터가 없습니다</p>
      </div>
    );
  }

  // 차트 클릭 이벤트 핸들러
  const onChartClick = (params: any) => {
    if (params.data && params.data.spanData && onSpanSelect) {
      onSpanSelect(params.data.spanData.span_id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Flame Graph</h3>
          <p className="text-sm text-gray-500">전체 span 개수: {spans.length}</p>
        </div>
        <div className="flex items-center gap-4">
          {Array.from({ length: 5 }).map((_, i) => {
            const b = getBucketByIndex(i);
            return (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-3 h-3 rounded-full" style={{ background: b.color }}></div>
                <span>{b.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 bg-linear-to-br from-slate-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm overflow-hidden p-4">
        <ReactECharts
          option={option}
          style={{ height: `${Math.max(300, (maxDepth + 1) * 50)}px`, width: '100%' }}
          onEvents={{ click: onChartClick }}
        />
      </div>
    </div>
  );
}
