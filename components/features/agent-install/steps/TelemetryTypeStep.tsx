'use client';

import { TELEMETRY_TYPES } from '@/src/constants/agent-install';
import type { AgentSetupFormValues, TelemetryType } from '@/types/agent-install';

interface TelemetryTypeStepProps {
  formValues: AgentSetupFormValues;
  onChange: (values: AgentSetupFormValues) => void;
  onNext: (values?: Partial<AgentSetupFormValues>) => void;
  onPrev?: () => void;
}

export default function TelemetryTypeStep({
  formValues,
  onChange,
  onNext,
  onPrev,
}: TelemetryTypeStepProps) {
  const handleTelemetryToggle = (type: TelemetryType) => {
    const isSelected = formValues.telemetryTypes.includes(type);
    const newTypes = isSelected
      ? formValues.telemetryTypes.filter((t) => t !== type)
      : [...formValues.telemetryTypes, type];

    // Traces는 항상 포함되어야 함
    if (type === 'traces' && !isSelected) {
      onChange({ ...formValues, telemetryTypes: newTypes });
    } else if (type === 'traces' && isSelected && newTypes.length === 0) {
      // Traces 제거 방지
      return;
    } else {
      onChange({ ...formValues, telemetryTypes: newTypes });
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">수집 데이터 종류</h3>
        <p className="text-gray-600">
          SDK가 수집할 데이터 종류를 선택하세요. Traces는 필수 항목입니다.
        </p>
      </div>

      {/* 텔레메트리 타입 체크박스 */}
      <div className="space-y-3">
        {TELEMETRY_TYPES.map((telemetry) => {
          const isSelected = formValues.telemetryTypes.includes(telemetry.id);
          const isDisabled = telemetry.id === 'traces'; // Traces는 항상 활성화

          return (
            <label
              key={telemetry.id}
              className={`relative block rounded-lg border px-4 py-4 transition-all ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              } ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => !isDisabled && handleTelemetryToggle(telemetry.id)}
                disabled={isDisabled}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <div
                  className={`h-5 w-5 rounded border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : isDisabled
                      ? 'border-gray-300 bg-gray-100'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{telemetry.label}</p>
                  <p className="mt-1 text-sm text-gray-600">{telemetry.description}</p>
                  {telemetry.default && (
                    <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      필수
                    </span>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {/* 데이터 수집 안내 */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="font-medium text-blue-900 mb-2">📊 수집되는 데이터</h4>
        <div className="space-y-2 text-sm text-blue-700">
          <p>
            • <strong>Traces</strong>: HTTP 요청, 외부 API 호출, DB 쿼리 추적 (필수)
          </p>
          {formValues.telemetryTypes.includes('logs') && (
            <p>
              • <strong>Logs</strong>: 애플리케이션의 로그 수집
            </p>
          )}
        </div>
      </div>

      {/* 안내 사항 */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="font-medium text-blue-900 mb-2">ℹ️ 참고</h4>
        <p className="text-sm text-blue-700">
          Traces는 자동 계측으로 HTTP 요청, 외부 API 호출, DB 쿼리 등을 자동으로 추적합니다. Logs를
          추가로 활성화하면 애플리케이션의 상세 로그도 함께 수집할 수 있습니다.
        </p>
      </div>

      {/* 버튼 영역 */}
      <div className="flex gap-3">
        {onPrev && (
          <button
            onClick={onPrev}
            className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            이전 단계로
          </button>
        )}
        <button
          onClick={() => onNext()}
          className="flex-1 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          다음 단계로
        </button>
      </div>
    </div>
  );
}
