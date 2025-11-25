'use client';

import type { ComputedSlo } from '@/src/types/notification';
import type { ReactElement } from 'react';
import { useState } from 'react';

// SLO 타입별 정보 (아이콘, 라벨, 색상)
const metricConfig: Record<string, { icon: ReactElement; label: string; color: string }> = {
  availability: {
    label: '가용성',
    color: 'green',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  latency: {
    label: '레이턴시',
    color: 'yellow',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  error_rate: {
    label: '에러율',
    color: 'red',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01M5.06 19h13.88c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.7-1.33-3.46 0L3.33 16c-.77 1.33.19 3 1.73 3z"
        />
      </svg>
    ),
  },
};

const colorMap = {
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
  red: { bg: 'bg-red-50', text: 'text-red-600' },
};

interface SloCardProps {
  slo: ComputedSlo;
  onEdit: (slo: ComputedSlo) => void;
  onDelete: (slo: ComputedSlo) => void;
  onToggle?: (slo: ComputedSlo, enabled: boolean) => void;
  enabled?: boolean;
}

const statusColorMap = {
  GOOD: 'text-green-600',
  WARNING: 'text-yellow-600',
  FAILED: 'text-red-600',
} as const;

export function SloCard({ slo, onEdit, onDelete, enabled = true, onToggle }: SloCardProps) {
  const usedPct = slo.errorBudgetUsedRate * 100;
  const remainingPct = Math.max(0, slo.errorBudgetRemainingPct);
  const overPct = Math.max(0, slo.errorBudgetOverPct);

  const [active, setActive] = useState(enabled);

  // 메트릭 타입에 따른 포맷팅 함수
  const isLatency = slo.metric === 'latency';
  const isPercentageMetric = slo.metric === 'availability' || slo.metric === 'error_rate';

  // SLI 값 포맷팅 (availability/error_rate는 %로, latency는 ms로)
  const formatSliValue = (value: number): string => {
    if (isPercentageMetric) {
      return `${(value * 100).toFixed(2)}%`;
    } else if (isLatency) {
      return `${value.toFixed(0)}ms`;
    }
    return `${value.toFixed(2)}`;
  };

  // 목표값 포맷팅
  const formatTargetValue = (value: number): string => {
    if (isPercentageMetric) {
      return `${Math.round(value * 10000) / 100}%`;
    } else if (isLatency) {
      return `${Math.round(value)}ms`;
    }
    return `${value.toFixed(2)}`;
  };

  const handleToggle = () => {
    const next = !active;
    setActive(next);
    onToggle?.(slo, next);
  };

  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm transition-all duration-150 ${
        active
          ? 'bg-white border-gray-200 hover:shadow-md'
          : 'bg-gray-50 border-gray-300 opacity-70'
      }`}
    >
      {/* 상단: 아이콘 + 제목 + tooltip + 상태 + 액션 + 토글 */}
      <div className="flex items-start justify-between w-full">
        {/* 왼쪽: 아이콘 + 제목 */}
        <div className="flex items-center gap-3 flex-1">
          {/* 아이콘 + 메트릭 타입 */}
          <div
            className={`w-16 h-16 flex flex-col items-center justify-center rounded-xl ${
              colorMap[metricConfig[slo.metric].color].bg
            }`}
          >
            <div className={colorMap[metricConfig[slo.metric].color].text}>
              {metricConfig[slo.metric].icon}
            </div>
            <span
              className={`text-xs font-semibold mt-1 ${
                colorMap[metricConfig[slo.metric].color].text
              }`}
            >
              {metricConfig[slo.metric].label}
            </span>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">{slo.name}</h3>
            {slo.serviceName && (
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                  {slo.serviceName}
                </span>
              </div>
            )}
            {slo.description && <p className="mt-1 text-sm text-gray-600">{slo.description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onEdit(slo)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            수정
          </button>

          <button
            type="button"
            onClick={() => onDelete(slo)}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            삭제
          </button>

          {/* 토글 */}
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              active ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                active ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {!active && <div className="mt-4 text-xs text-gray-400">(이 SLO는 비활성화 상태입니다)</div>}

      {active && (
        <>
          {/* 중단 지표 */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4">
              <div className="text-xs text-gray-500">SLI(지표)</div>
              <div className="mt-1 text-3xl font-bold text-gray-900">
                {formatSliValue(slo.sliValue)}
              </div>
              <div className="mt-1 text-xs text-gray-500">목표 {formatTargetValue(slo.target)}</div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4">
              <div className="text-xs text-gray-500">남은 허용치</div>
              <div className="mt-1 text-3xl font-bold text-gray-900">
                {remainingPct.toFixed(1)}%
              </div>
              <div className={`mt-1 text-xs font-semibold ${statusColorMap[slo.status]}`}>
                사용률 {usedPct.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-5 space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-gray-800">
              <span>허용치</span>
              <span className={statusColorMap[slo.status]}>사용률 {usedPct.toFixed(1)}%</span>
            </div>

            <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  slo.status === 'FAILED'
                    ? 'bg-red-500'
                    : slo.status === 'WARNING'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, usedPct)}%` }}
              />
            </div>

            {overPct > 0 && (
              <div className="text-xs font-semibold text-red-600">
                허용치 초과 +{overPct.toFixed(1)}%
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
