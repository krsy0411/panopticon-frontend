'use client';

import { KeyboardEvent } from 'react';
import type { ServiceSummary } from '@/types/apm';

interface ServiceCardProps {
  service: ServiceSummary;
  onClick?: (service: ServiceSummary) => void;
}

// 레이턴시 단위 변환
function formatLatency(latencyMs: number) {
  if (latencyMs >= 1000) {
    return `${(latencyMs / 1000).toFixed(2)}s`;
  }
  return `${Math.round(latencyMs)}ms`;
}

// Healthy 여부 계산
function isErrorHealthy(errorRate: number) {
  const percent = errorRate * 100;
  return percent < 1; // 1% 미만이면 초록색
}

function isLatencyHealthy(latencyMs: number) {
  return latencyMs < 400; // 400ms 미만이면 초록색
}

export default function ServiceCard({ service, onClick }: ServiceCardProps) {
  const { service_name, environment, request_count, error_rate, latency_p95_ms } = service;
  const isInteractive = typeof onClick === 'function';
  const errorHealthy = isErrorHealthy(error_rate); // Healthy 여부 계산
  const latencyHealthy = isLatencyHealthy(latency_p95_ms);

  // 마우스 클릭 처리
  const handleClick = () => {
    onClick?.(service);
  };

  // Enter나 Space로도 클릭 가능하도록 처리
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!isInteractive) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.(service);
    }
  };

  // 전체 카드 UI 컨테이너
  return (
    <article
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
        isInteractive
          ? 'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'
          : ''
      }`}
    >
      {/* 카드 상단 영역: 서비스명 + environment 뱃지 */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">{service_name}</p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            {environment}
          </span>
        </div>
      </header>

      {/* 하단 지표: Requests / Error rate / Latency */}
      <dl className="mt-6 grid grid-cols-3 gap-4">
        <div>
          <dt className="text-xs text-gray-400">Requests</dt>
          <dd className="text-lg font-semibold text-gray-900">{request_count.toLocaleString()}</dd>
        </div>

        <div>
          <dt className="text-xs text-gray-400">Error rate</dt>
          <dd
            className={`text-lg font-semibold ${
              errorHealthy ? 'text-emerald-600' : 'text-rose-600' // Error rate 색상 적용
            }`}
          >
            {(error_rate * 100).toFixed(2)}%
          </dd>
        </div>

        <div>
          <dt className="text-xs text-gray-400">Latency</dt>
          <dd
            className={`text-lg font-semibold ${
              latencyHealthy ? 'text-emerald-600' : 'text-rose-600' // Latency 색상 적용
            }`}
          >
            {formatLatency(latency_p95_ms)}
          </dd>
        </div>
      </dl>
    </article>
  );
}
