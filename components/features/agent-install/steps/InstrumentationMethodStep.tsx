'use client';

import type { Agent, AgentSetupFormValues } from '@/types/agent-install';

interface InstrumentationMethodStepProps {
  agent: Agent;
  formValues: AgentSetupFormValues;
  onChange: (values: AgentSetupFormValues) => void;
  onNext: (values?: Partial<AgentSetupFormValues>) => void;
}

export default function InstrumentationMethodStep({
  agent,
  onNext,
}: InstrumentationMethodStepProps) {
  return (
    <div className="space-y-8 max-w-2xl">
      {/* 정보 섹션 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">자동 계측 SDK</h3>
        <p className="text-sm text-gray-600">
          당사의 SDK는 자동 계측 기반으로 설정 없이 자동으로 라이브러리를 감지하여 계측합니다.
        </p>
      </div>

      {/* 지원 프레임워크 정보 */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="font-medium text-blue-900 mb-3">✨ 지원되는 프레임워크</h4>
        <div className="grid grid-cols-2 gap-2">
          {agent.frameworks.map((fw) => (
            <div key={fw.id} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-600" />
              <span className="text-sm text-blue-700">{fw.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 자동 계측 설명 */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <h4 className="font-medium text-green-900 mb-2">📌 자동 계측 방식</h4>
        <p className="text-sm text-green-700">
          설정 없이 자동으로 라이브러리를 감지하여 계측합니다. 가장 빠르고 간편한 방법입니다.
        </p>
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={() => onNext()}
        className="w-full px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        다음 단계로
      </button>
    </div>
  );
}
