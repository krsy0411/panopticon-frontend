'use client';

import { useState } from 'react';

export interface SLOTarget {
  id: string;
  metric: 'availability' | 'latency' | 'error_rate';
  target: number;
  enabled: boolean;
}

export interface SLOConfigurationProps {
  onSave?: (targets: SLOTarget[]) => void;
}

const metricConfig = {
  availability: {
    name: '가용성',
    description: '서비스가 정상적으로 응답하는 비율',
    unit: '%',
    min: 90,
    max: 100,
    step: 0.1,
    default: 99.9,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  latency: {
    name: '레이턴시',
    description: '요청 응답 시간의 목표값 (P95)',
    unit: 'ms',
    min: 10,
    max: 5000,
    step: 10,
    default: 200,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  error_rate: {
    name: '에러율',
    description: '전체 요청 중 에러 발생 비율의 최대 허용치',
    unit: '%',
    min: 0,
    max: 10,
    step: 0.1,
    default: 1.0,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

export default function SLOConfiguration({ onSave }: SLOConfigurationProps) {
  const [targets, setTargets] = useState<SLOTarget[]>([
    { id: '1', metric: 'availability', target: 99.9, enabled: false },
    { id: '2', metric: 'latency', target: 200, enabled: false },
    { id: '3', metric: 'error_rate', target: 1.0, enabled: false },
  ]);

  const handleToggle = (id: string) => {
    setTargets((prev) =>
      prev.map((target) => (target.id === id ? { ...target, enabled: !target.enabled } : target)),
    );
  };

  const handleValueChange = (id: string, value: number) => {
    setTargets((prev) =>
      prev.map((target) => (target.id === id ? { ...target, target: value } : target)),
    );
  };

  const handleSave = () => {
    onSave?.(targets);
    console.log('SLO 설정 저장:', targets);
  };

  const handleReset = () => {
    const defaultTargets = [
      { id: '1', metric: 'availability' as const, target: 99.9, enabled: false },
      { id: '2', metric: 'latency' as const, target: 200, enabled: false },
      { id: '3', metric: 'error_rate' as const, target: 1.0, enabled: false },
    ];
    setTargets(defaultTargets);
    localStorage.removeItem('slo_targets');
  };

  const enabledCount = targets.filter((t) => t.enabled).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">SLO 설정</h2>
          <p className="text-sm text-gray-600 mt-1">
            서비스 레벨 목표를 설정하고 목표 미달 시 알림을 받으세요
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{enabledCount}</div>
          <div className="text-xs text-gray-500">활성화됨</div>
        </div>
      </div>

      {/* SLO 타겟 목록 */}
      <div className="space-y-4 mb-6">
        {targets.map((target) => {
          const config = metricConfig[target.metric];
          return (
            <div
              key={target.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                target.enabled
                  ? `${config.borderColor} bg-linear-to-r ${config.bgColor} shadow-sm`
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* SLO 헤더 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`w-10 h-10 rounded-lg ${config.bgColor} ${config.color} flex items-center justify-center shrink-0`}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900">{config.name}</h3>
                    <p className="text-xs text-gray-600">{config.description}</p>
                  </div>
                </div>
                {/* 토글 스위치 */}
                <button
                  onClick={() => handleToggle(target.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shrink-0 ${
                    target.enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={target.enabled}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      target.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 목표값 설정 (활성화된 경우) */}
              {target.enabled && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-700">목표값</label>
                    <div className="flex items-baseline gap-1">
                      <input
                        type="number"
                        value={target.target}
                        onChange={(e) => handleValueChange(target.id, parseFloat(e.target.value))}
                        min={config.min}
                        max={config.max}
                        step={config.step}
                        className="w-20 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{config.unit}</span>
                    </div>
                  </div>
                  {/* 슬라이더 */}
                  <input
                    type="range"
                    value={target.target}
                    onChange={(e) => handleValueChange(target.id, parseFloat(e.target.value))}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>
                      {config.min}
                      {config.unit}
                    </span>
                    <span>
                      {config.max}
                      {config.unit}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={enabledCount === 0}
          className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          설정 저장
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          초기화
        </button>
      </div>

      {/* 안내 메시지 */}
      {enabledCount === 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 최소 하나 이상의 SLO를 활성화해주세요. 목표 미달 시 설정한 알림 채널로 알림이
            전송됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
