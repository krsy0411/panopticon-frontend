'use client';

import { RUNTIME_ENVIRONMENTS } from '@/src/constants/agent-install';
import type { AgentSetupFormValues, RuntimeEnvironment } from '@/types/agent-install';

interface RuntimeEnvironmentStepProps {
  formValues: AgentSetupFormValues;
  onChange: (values: AgentSetupFormValues) => void;
  onNext: (values?: Partial<AgentSetupFormValues>) => void;
  onPrev?: () => void;
}

export default function RuntimeEnvironmentStep({
  formValues,
  onChange,
  onNext,
  onPrev,
}: RuntimeEnvironmentStepProps) {
  const handleEnvironmentChange = (env: RuntimeEnvironment) => {
    onChange({ ...formValues, runtimeEnvironment: env });
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">실행 환경 선택</h3>
        <p className="text-gray-600">
          SDK가 실행될 환경을 선택하세요. 선택한 환경에 맞는 설치 가이드가 제공됩니다.
        </p>
      </div>

      {/* 환경 선택 그리드 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {RUNTIME_ENVIRONMENTS.map((env) => (
          <label key={env.id} className="relative block cursor-pointer">
            <input
              type="radio"
              name="runtimeEnvironment"
              value={env.id}
              checked={formValues.runtimeEnvironment === env.id}
              onChange={() => handleEnvironmentChange(env.id)}
              className="sr-only"
            />
            <div
              className={`rounded-lg border-2 px-4 py-4 transition-all ${
                formValues.runtimeEnvironment === env.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`h-5 w-5 rounded-full border-2 mt-0.5 shrink-0 ${
                    formValues.runtimeEnvironment === env.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}
                >
                  {formValues.runtimeEnvironment === env.id && (
                    <div className="h-full w-full flex items-center justify-center text-white text-xs font-bold">
                      ✓
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{env.label}</p>
                  <p className="mt-1 text-sm text-gray-600">{env.description}</p>
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* 환경별 설명 */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="font-medium text-blue-900 mb-2">📌 선택한 환경 설명</h4>
        <p className="text-sm text-blue-700">
          {formValues.runtimeEnvironment === 'docker'
            ? 'Docker 컨테이너 환경에서 실행되는 애플리케이션입니다. 환경변수를 설정하여 실행할 수 있습니다.'
            : formValues.runtimeEnvironment === 'linux-host'
            ? 'Linux VM 또는 베어메탈에서 실행되는 애플리케이션입니다. Systemd 또는 직접 실행합니다.'
            : 'Windows 서버에서 실행되는 애플리케이션입니다. 환경변수와 PowerShell을 이용합니다.'}
        </p>
      </div>

      {/* 주의사항 */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h4 className="font-medium text-amber-900 mb-2">⚠️ 주의사항</h4>
        <ul className="space-y-1 text-sm text-amber-800">
          <li>• 선택한 환경이 실제 배포 환경과 일치해야 설치 가이드가 정확합니다.</li>
          <li>• 나중에 환경을 변경하면 설치 방법이 달라질 수 있습니다.</li>
        </ul>
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
