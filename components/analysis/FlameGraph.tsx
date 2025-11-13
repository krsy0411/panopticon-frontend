/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { SpanItem } from '@/types/apm';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface FlameGraphProps {
  spans: SpanItem[];
  onSpanSelect?: (spanId: string) => void;
}

interface FlameBlock {
  span: SpanItem;
  depth: number;
  startOffset: number; // 부모 내에서의 상대적 시작 위치 (0~1)
  widthRatio: number; // 부모 대비 너비 비율 (0~1)
}

export default function FlameGraph({ spans, onSpanSelect }: FlameGraphProps) {
  // 스팬을 Flame Graph 블록으로 변환
  const { flameBlocks, maxDepth } = useMemo(() => {
    if (!spans || spans.length === 0) return { flameBlocks: [], maxDepth: 0 };

    // 루트 스팬 찾기
    const rootSpan = spans.find((s) => !s.parent_span_id);
    if (!rootSpan) return { flameBlocks: [], maxDepth: 0 };

    const blocks: FlameBlock[] = [];
    let maxDepthFound = 0;

    // 재귀적으로 블록 생성
    const buildBlocks = (
      span: SpanItem,
      depth: number,
      parentStart: number,
      parentWidth: number,
    ) => {
      maxDepthFound = Math.max(maxDepthFound, depth);

      // 현재 스팬의 블록 추가
      blocks.push({
        span,
        depth,
        startOffset: parentStart,
        widthRatio: parentWidth,
      });

      // 자식 스팬들 찾기
      const children = spans.filter((s) => s.parent_span_id === span.span_id);

      if (children.length > 0) {
        // 자식들의 총 duration
        const childrenTotalDuration = children.reduce((sum, child) => sum + child.duration_ms, 0);

        let currentOffset = parentStart;

        children.forEach((child) => {
          // 자식의 너비 비율 (부모의 너비 * 자식 duration / 자식들 총 duration)
          const childWidthRatio = parentWidth * (child.duration_ms / childrenTotalDuration);

          buildBlocks(child, depth + 1, currentOffset, childWidthRatio);

          currentOffset += childWidthRatio;
        });
      }
    };

    buildBlocks(rootSpan, 0, 0, 1);

    return {
      flameBlocks: blocks,
      maxDepth: maxDepthFound,
    };
  }, [spans]);

  // 색상 함수
  const getColorByStatus = (status: string, kind: string) => {
    if (status === 'ERROR') return '#ef4444'; // red-500
    switch (kind) {
      case 'SERVER':
        return '#3b82f6'; // blue-500
      case 'CLIENT':
        return '#10b981'; // green-500
      case 'INTERNAL':
        return '#8b5cf6'; // purple-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  const option = useMemo(() => {
    if (flameBlocks.length === 0) return {};

    // 루트 스팬의 duration을 전체 시간으로 사용
    const rootSpan = spans.find((s) => !s.parent_span_id);
    const totalDuration = rootSpan?.duration_ms || 0;

    // Custom 시리즈 데이터 생성 (0-totalDuration 범위로 변경)
    const seriesData = flameBlocks.map((block) => ({
      value: [
        block.startOffset * totalDuration, // X 시작 위치 (0-totalDuration ms)
        block.depth, // Y 위치 (depth)
        (block.startOffset + block.widthRatio) * totalDuration, // X 끝 위치 (0-totalDuration ms)
        block.span.duration_ms, // duration (tooltip용)
      ],
      itemStyle: {
        color: getColorByStatus(block.span.status, block.span.kind),
      },
      spanData: block.span,
    }));

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
        textStyle: { color: '#f9fafb', fontSize: 12 },
        formatter: (params: any) => {
          const data = params.data.spanData;
          return `
            <div style="font-weight:700;margin-bottom:6px;font-size:14px;">${data.name}</div>
            <div style="margin:2px 0;">소요시간: ${data.duration_ms}ms</div>
            <div style="margin:2px 0;">서비스명: ${data.service_name}</div>
            <div style="margin:2px 0;">종류: ${data.kind}</div>
            <div style="margin:2px 0;">상태: ${data.status}</div>
            ${
              data.http_method
                ? `<div style="margin:2px 0;">HTTP: ${data.http_method} ${
                    data.http_path || ''
                  }</div>`
                : ''
            }
            ${
              data.db_statement
                ? `<div style="margin:2px 0;">DB: ${data.db_statement.substring(0, 50)}...</div>`
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
                    fontSize: 11,
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
      </div>

      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <ReactECharts
          option={option}
          style={{ height: `${Math.max(300, (maxDepth + 1) * 50)}px` }}
          onEvents={{ click: onChartClick }}
        />
      </div>
    </div>
  );
}
