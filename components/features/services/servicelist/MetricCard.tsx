// 요청수/에러율/레이턴시 카드를 공통 UI로 렌더링

'use client';

import { KeyboardEvent } from 'react';
import type { MetricCardProps, MetricTone } from '@/types/servicelist';
import { getEnvironmentStyle } from '../../../../src/types/environmentStyles';

// 카드 색상 톤 정의
const toneStyles: Record<MetricTone, { border: string; primary: string; status: string }> = {
  neutral: { border: 'border-gray-300', primary: 'text-gray-900', status: 'text-gray-600' },
  success: {
    border: 'border-emerald-400',
    primary: 'text-emerald-600',
    status: 'text-emerald-600',
  },
  caution: { border: 'border-yellow-400', primary: 'text-yellow-600', status: 'text-yellow-600' },
  warning: { border: 'border-orange-400', primary: 'text-orange-600', status: 'text-orange-600' },
  danger: { border: 'border-red-500', primary: 'text-red-600', status: 'text-red-600' },
};

export default function ServiceMetricCard({
  serviceName,
  environment,
  primaryValue,
  secondaryValue,
  statusLabel,
  tone = 'neutral',
  onClick,
}: MetricCardProps) {
  const toneClass = toneStyles[tone];
  const trimmed = primaryValue.trim();
  const match = trimmed.match(/^([\d.,]+)/);
  const numberPart = match ? match[1] : trimmed;
  const unitPart = match ? trimmed.slice(match[1].length) : '';
  const isInteractive = typeof onClick === 'function';

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!isInteractive) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  const environmentStyle = getEnvironmentStyle(environment);

  return (
    <article
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`w-full max-w-[16rem] rounded-2xl border-[2px] ${
        toneClass.border
      } bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
        isInteractive
          ? 'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
          : ''
      }`}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">{serviceName}</p>
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1 ${environmentStyle.chip}`}
          >
            <span className={`h-2 w-2 rounded-full ${environmentStyle.dot}`} />
            {environment}
          </span>
        </div>
      </div>
      {/* 메인 값 */}
      <div className={`text-right font-semibold ${toneClass.primary}`}>
        <span className="inline-flex items-end justify-end gap-1 leading-none">
          <span className="text-7xl">{numberPart}</span>
          {unitPart && <span className="text-2xl pb-1">{unitPart}</span>}
        </span>
      </div>
      {/* 보조 설명 */}
      <p className="text-sm text-gray-600 mt-1 text-right">{secondaryValue}</p>
      <div className="mt-4 text-right text-sm">
        <span className={`font-medium ${toneClass.status}`}>{statusLabel ?? '-'}</span>
      </div>
    </article>
  );
}
