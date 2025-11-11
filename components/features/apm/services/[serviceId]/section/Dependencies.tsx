'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

// API 응답 타입
interface DependencyRequest {
  service_name: string;
  total_requests: number;
  error_rate: number;
}

interface DependencyResponse {
  service_name: string;
  incoming_requests: DependencyRequest[];
  outgoing_requests: DependencyRequest[];
}

interface ChartParams {
  dataType: 'node' | 'edge';
  name?: string;
  data?: {
    source: string;
    target: string;
    value: number;
    error_rate: number;
  };
}

// 색상 상수
const COLORS = {
  // 노드 색상
  node: {
    current: '#3b82f6', // 현재 서비스 (파란색)
    incoming: '#8b5cf6', // 들어오는 요청 (보라색)
    outgoing: '#10b981', // 나가는 요청 (초록색)
  },
  // 에러율에 따른 색상
  errorRate: {
    high: '#ef4444', // 높은 에러율 (빨간색)
    medium: '#f97316', // 중간 에러율 (오렌지색)
    low: '#10b981', // 낮은 에러율 (초록색)
  },
  // 에러율 배지 배경색
  errorBadge: {
    high: {
      bg: '#fee2e2',
      text: '#991b1b',
    },
    medium: {
      bg: '#fed7aa',
      text: '#92400e',
    },
    low: {
      bg: '#d1fae5',
      text: '#065f46',
    },
  },
  // 기타
  border: '#fff',
  emphasis: '#1e40af',
  line: '#9ca3af',
  lineEmphasis: '#1f2937',
  label: '#1f2937',
} as const;

// HTML 특수문자 이스케이프 (XSS 방지)
const escapeHtml = (str: string): string => {
  return str.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[c] || c),
  );
};

// 툴팁: 노드(서비스) 정보 HTML 생성
const createNodeTooltipHtml = (nodeName: string): string => {
  return `<div style="font-weight:600;">${escapeHtml(nodeName)}</div>`;
};

// 툴팁: 엣지(연결선) 정보 HTML 생성
const createEdgeTooltipHtml = (
  source: string,
  target: string,
  totalRequests: number,
  errorRate: number,
  timeRangeInSeconds: number,
): string => {
  const rps = (totalRequests / timeRangeInSeconds).toFixed(0);
  const errorRatePercent = (errorRate * 100).toFixed(1);

  return `
    <div style="font-weight:600;">${escapeHtml(source)} → ${escapeHtml(target)}</div>
    <div style="margin-top:4px;">
      <div>Total Requests: ${totalRequests.toLocaleString()}</div>
      <div>RPS: ${rps}</div>
      <div>Error Rate: ${errorRatePercent}%</div>
    </div>
  `;
};

// 에러율에 따른 색상
const getErrorColor = (errorRate: number): string => {
  if (errorRate > 0.5) return COLORS.errorRate.high;
  if (errorRate > 0.2) return COLORS.errorRate.medium;
  return COLORS.errorRate.low;
};

export default function DependenciesSection() {
  const [dependencies, setDependencies] = useState<DependencyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 시간 범위 (1시간 = 3600초)
  const timeRangeInSeconds = 3600;

  // API 호출 함수
  const fetchDependencies = useCallback(async () => {
    try {
      // TODO: 실제 API 엔드포인트로 교체 필요
      // const serviceId = window.location.pathname.split('/').pop();
      // const now = new Date();
      // const startTime = new Date(now.getTime() - timeRangeInSeconds * 1000).toISOString();
      // const endTime = now.toISOString();
      // const response = await fetch(
      //   `/api/apm/services/${serviceId}/dependencies?start_time=${startTime}&end_time=${endTime}`
      // );

      // 임시: 더미 데이터 생성
      const mockResponse: DependencyResponse = {
        service_name: 'user-service',
        incoming_requests: [
          {
            service_name: 'api-gateway',
            total_requests: 54000,
            error_rate: 0.5,
          },
          {
            service_name: 'admin-service',
            total_requests: 12000,
            error_rate: 0.3,
          },
        ],
        outgoing_requests: [
          {
            service_name: 'database',
            total_requests: 162000,
            error_rate: 0.1,
          },
          {
            service_name: 'cache-service',
            total_requests: 108000,
            error_rate: 0.05,
          },
          {
            service_name: 'payment-service',
            total_requests: 45000,
            error_rate: 0.8,
          },
        ],
      };

      setDependencies(mockResponse);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dependencies');
      console.error('Error fetching dependencies:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  // ECharts 옵션 생성
  const chartOption = useMemo(() => {
    if (!dependencies) return {};

    const currentService = dependencies.service_name;
    const incomingRequests = dependencies.incoming_requests;
    const outgoingRequests = dependencies.outgoing_requests;

    // 노드 생성 (Incoming → Current → Outgoing 구조)
    const nodes: Array<{ name: string; x?: number; y?: number; symbolSize?: number }> = [];
    const links: Array<{ source: string; target: string; value: number; error_rate: number }> = [];

    // 중앙: 현재 서비스
    nodes.push({
      name: currentService,
      symbolSize: 80,
      x: 50,
      y: 50,
    });

    // Incoming 서비스들 (좌측 배치)
    incomingRequests.forEach((req, idx) => {
      const yPosition = 20 + (idx * 60) / Math.max(incomingRequests.length - 1, 1);
      nodes.push({
        name: req.service_name,
        symbolSize: 40,
        x: 10,
        y: yPosition,
      });

      // Incoming 링크 (방향: incoming service → current service)
      links.push({
        source: req.service_name,
        target: currentService,
        value: req.total_requests,
        error_rate: req.error_rate,
      });
    });

    // Outgoing 서비스들 (우측 배치)
    outgoingRequests.forEach((req, idx) => {
      const yPosition = 20 + (idx * 60) / Math.max(outgoingRequests.length - 1, 1);
      nodes.push({
        name: req.service_name,
        symbolSize: 40,
        x: 90,
        y: yPosition,
      });

      // Outgoing 링크 (방향: current service → outgoing service)
      links.push({
        source: currentService,
        target: req.service_name,
        value: req.total_requests,
        error_rate: req.error_rate,
      });
    });

    return {
      backgroundColor: 'transparent',
      // 마우스를 올렸을 때 나타나는 정보 팝업창
      tooltip: {
        trigger: 'item',
        formatter: (params: ChartParams) => {
          // 데이터 타입이 node인 경우 (서비스 원)
          if (params.dataType === 'node') {
            return createNodeTooltipHtml(params.name ?? '');
          }

          // 데이터 타입이 edge인 경우 (서비스 간 연결선)
          if (params.dataType === 'edge' && params.data) {
            return createEdgeTooltipHtml(
              params.data.source,
              params.data.target,
              params.data.value,
              params.data.error_rate,
              timeRangeInSeconds,
            );
          }

          // 기본적으로 빈 문자열 반환
          return '';
        },
      },
      animationDuration: 1000,
      animationEasing: 'cubicOut',
      // 차트에 표시할 데이터 시리즈(계열) 정의 부분(= 차트 핵심 설정)
      series: [
        {
          type: 'graph',
          layout: 'none',
          roam: true,
          // 노드 이름 라벨 스타일
          label: {
            show: true,
            position: 'bottom',
            distance: 10,
            fontSize: 11,
            color: COLORS.label,
            fontWeight: 'bold',
          },
          // 선(엣지) 기본 스타일
          lineStyle: {
            color: COLORS.line,
            width: 2,
            curveness: 0.3,
          },
          // 마우스 올렸을 때 강조 스타일
          emphasis: {
            lineStyle: {
              width: 4,
              color: COLORS.lineEmphasis,
            },
            // 노드 강조 스타일
            itemStyle: {
              color: COLORS.emphasis,
              borderWidth: 3,
            },
          },
          edgeSymbol: ['none', 'arrow'],
          edgeSymbolSize: [0, 12],
          // 그래프의 노드들(원 = 서비스)
          nodes: nodes.map((node) => ({
            name: node.name,
            x: (node.x ?? 0) * 50,
            y: (node.y ?? 0) * 50,
            symbolSize: node.symbolSize,
            itemStyle: {
              color:
                node.name === currentService
                  ? COLORS.node.current
                  : incomingRequests.some((req) => req.service_name === node.name)
                  ? COLORS.node.incoming
                  : COLORS.node.outgoing,
              borderColor: COLORS.border,
              borderWidth: 1,
            },
          })),
          // 노드 간 연결선(화살표)
          links: links.map((link) => {
            const lineWidth = Math.min(link.value / 20000 + 1, 20);
            const arrowSize = Math.max(lineWidth * 2, 20);
            return {
              source: link.source,
              target: link.target,
              value: link.value,
              error_rate: link.error_rate,
              symbol: ['none', 'arrow'],
              symbolSize: [0, arrowSize], // 동적 화살표 크기 (선보다 큼)
              lineStyle: {
                color: getErrorColor(link.error_rate),
                width: lineWidth, // 요청량에 따라 선 굵기 조절
                cap: 'butt', // 선 끝을 각지게
              },
            };
          }),
        },
      ],
    };
  }, [dependencies]);

  if (error) {
    return (
      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <div className="text-center text-red-500 py-8">
          <p className="font-semibold mb-2">Error loading dependencies</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <div className="text-center text-gray-500 py-8">Loading service dependencies...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Service Dependencies</h2>

      {/* 범례 */}
      <div className="mb-4 flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: COLORS.node.current }}
          ></div>
          <span className="text-gray-700">Current Service</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: COLORS.node.incoming }}
          ></div>
          <span className="text-gray-700">Incoming</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: COLORS.node.outgoing }}
          ></div>
          <span className="text-gray-700">Outgoing</span>
        </div>
      </div>

      {/* 에러율 범례 */}
      <div className="mb-6 flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-1" style={{ backgroundColor: COLORS.errorRate.high }}></div>
          <span className="text-gray-700">High Error Rate (&gt;50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-1" style={{ backgroundColor: COLORS.errorRate.medium }}></div>
          <span className="text-gray-700">Medium Error Rate (20-50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-1" style={{ backgroundColor: COLORS.errorRate.low }}></div>
          <span className="text-gray-700">Low Error Rate (&lt;20%)</span>
        </div>
      </div>

      {/* 메인 콘텐츠 - 2열 레이아웃 */}
      <div className="grid grid-cols-[400px_1fr] gap-6">
        {/* 좌측: 상세 정보 */}
        {dependencies && (
          <div className="space-y-6">
            {/* Incoming */}
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-3">Incoming Requests</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {dependencies.incoming_requests.map((req) => (
                  <div
                    key={req.service_name}
                    className="p-3 bg-gray-50 rounded-lg hover:cursor-pointer" // TODO: 추후 클릭 시 상세 정보 표시 기능 추가 예정
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">{req.service_name}</span>
                      <span
                        className="px-2 py-1 rounded text-xs font-semibold"
                        style={{
                          backgroundColor:
                            req.error_rate > 0.5
                              ? COLORS.errorBadge.high.bg
                              : req.error_rate > 0.2
                              ? COLORS.errorBadge.medium.bg
                              : COLORS.errorBadge.low.bg,
                          color:
                            req.error_rate > 0.5
                              ? COLORS.errorBadge.high.text
                              : req.error_rate > 0.2
                              ? COLORS.errorBadge.medium.text
                              : COLORS.errorBadge.low.text,
                        }}
                      >
                        {(req.error_rate * 100).toFixed(1)}% error
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {req.total_requests.toLocaleString()} requests (
                      {(req.total_requests / timeRangeInSeconds).toFixed(0)} RPS)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Outgoing */}
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-3">Outgoing Requests</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {dependencies.outgoing_requests.map((req) => (
                  <div
                    key={req.service_name}
                    className="p-3 bg-gray-50 rounded-lg hover:cursor-pointer" // TODO: 추후 클릭 시 상세 정보 표시 기능 추가 예정
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">{req.service_name}</span>
                      <span
                        className="px-2 py-1 rounded text-xs font-semibold"
                        style={{
                          backgroundColor:
                            req.error_rate > 0.5
                              ? COLORS.errorBadge.high.bg
                              : req.error_rate > 0.2
                              ? COLORS.errorBadge.medium.bg
                              : COLORS.errorBadge.low.bg,
                          color:
                            req.error_rate > 0.5
                              ? COLORS.errorBadge.high.text
                              : req.error_rate > 0.2
                              ? COLORS.errorBadge.medium.text
                              : COLORS.errorBadge.low.text,
                        }}
                      >
                        {(req.error_rate * 100).toFixed(1)}% error
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {req.total_requests.toLocaleString()} requests (
                      {(req.total_requests / timeRangeInSeconds).toFixed(0)} RPS)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 우측: 차트 */}
        <div>
          <ReactECharts option={chartOption} style={{ height: 700 }} />
        </div>
      </div>
    </div>
  );
}
