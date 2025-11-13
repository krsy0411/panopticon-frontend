/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { SpanItem } from '@/types/apm';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface WaterfallChartProps {
  spans: SpanItem[];
  onSpanSelect?: (spanId: string) => void;
}

export default function WaterfallChart({ spans, onSpanSelect }: WaterfallChartProps) {
  // 스팬을 시간순으로 정렬하고 waterfall 데이터로 변환
  const waterfallData = useMemo(() => {
    if (!spans || spans.length === 0) return null;

    // 루트 스팬 찾기
    const rootSpan = spans.find((s) => !s.parent_span_id);
    const childSpans = spans.filter((s) => s.parent_span_id);

    // 자식 스팬들을 시작 시간 기준으로 역순 정렬 (나중에 시작된 것이 위로)
    const sortedChildSpans = childSpans.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // 자식들을 먼저, 루트 스팬을 맨 마지막에 (화면에서는 맨 위에 표시됨)
    const sortedSpans = rootSpan ? [...sortedChildSpans, rootSpan] : sortedChildSpans;

    // 전체 트레이스의 시작 시간 (루트 스팬 또는 가장 빠른 스팬 기준)
    const traceStartTime = rootSpan
      ? new Date(rootSpan.timestamp).getTime()
      : Math.min(...spans.map((s) => new Date(s.timestamp).getTime()));

    // 각 스팬의 상대적 시작 시간과 duration 계산
    return sortedSpans.map((span) => {
      const spanStartTime = new Date(span.timestamp).getTime();
      const relativeStart = spanStartTime - traceStartTime;

      return {
        span,
        relativeStart,
        duration: span.duration_ms,
      };
    });
  }, [spans]);

  const option = useMemo(() => {
    if (!waterfallData) return {};

    const categories = waterfallData.map((item) => item.span.name);
    // 모든 스팬의 끝나는 시간 중 최대값을 X축 최대값으로 사용
    const maxTime = Math.max(...waterfallData.map((item) => item.relativeStart + item.duration));

    // 색상 함수
    const getColorByStatus = (status: string, kind: string) => {
      if (status === 'ERROR') return '#ef4444';
      switch (kind) {
        case 'SERVER':
          return '#3b82f6';
        case 'CLIENT':
          return '#10b981';
        case 'INTERNAL':
          return '#8b5cf6';
        default:
          return '#6b7280';
      }
    };

    // Custom series 데이터 생성
    const seriesData = waterfallData.map((item, index) => ({
      name: item.span.name,
      value: [index, item.relativeStart, item.relativeStart + item.duration, item.duration],
      itemStyle: {
        color: getColorByStatus(item.span.status, item.span.kind),
      },
      spanData: item.span,
    }));

    return {
      grid: {
        left: 200,
        right: 50,
        top: 50,
        bottom: 50,
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderColor: 'transparent',
        textStyle: { color: '#f9fafb', fontSize: 12 },
        formatter: (params: any) => {
          const data = params.data.spanData;
          const start = params.data.value[1].toFixed(2);
          const end = params.data.value[2].toFixed(2);
          return `
            <div style="font-weight:700;margin-bottom:6px;font-size:14px;">${data.name}</div>
            <div style="margin:2px 0;">시작: ${start}ms</div>
            <div style="margin:2px 0;">종료: ${end}ms</div>
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
          `;
        },
      },
      xAxis: {
        type: 'value',
        name: 'Time (ms)',
        nameLocation: 'middle',
        nameGap: 30,
        min: 0,
        max: maxTime,
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
        type: 'category',
        data: categories,
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
          width: 180,
          overflow: 'truncate',
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
      series: [
        {
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const categoryIndex = api.value(0);
            const start = api.coord([api.value(1), categoryIndex]);
            const end = api.coord([api.value(2), categoryIndex]);
            // 막대 높이를 더 작게 조정 (0.6 -> 0.4)
            const height = api.size([0, 1])[1] * 0.3;

            return {
              type: 'rect',
              shape: {
                x: start[0],
                y: start[1] - height / 2,
                width: end[0] - start[0],
                height: height,
              },
              style: api.style(),
            };
          },
          encode: {
            x: [1, 2],
            y: 0,
          },
          data: seriesData,
        },
      ],
    };
  }, [waterfallData]);

  if (!waterfallData) {
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
          <h3 className="text-lg font-semibold text-gray-900">Waterfall Chart</h3>
          <p className="text-sm text-gray-500">전체 span 개수: {spans.length}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <ReactECharts
          option={option}
          style={{ height: `${Math.max(300, spans.length * 50)}px` }}
          onEvents={{ click: onChartClick }}
        />
      </div>
    </div>
  );
}
