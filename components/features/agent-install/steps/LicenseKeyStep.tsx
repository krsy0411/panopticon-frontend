'use client';

import { useState } from 'react';
import { HiCheckCircle, HiDocumentDuplicate, HiArrowPath } from 'react-icons/hi2';
import { generateLicenseKey, maskLicenseKey } from '@/src/utils/keyGenerator';
import type { AgentSetupFormValues } from '@/types/agent-install';

interface LicenseKeyStepProps {
  formValues: AgentSetupFormValues;
  onChange: (values: AgentSetupFormValues) => void;
  onNext: (values?: Partial<AgentSetupFormValues>) => void;
  onPrev?: () => void;
}

export default function LicenseKeyStep({
  formValues,
  onChange,
  onNext,
  onPrev,
}: LicenseKeyStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFullKey, setShowFullKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [errors, setErrors] = useState<{ serviceName?: string }>({});

  const hasLicenseKey = !!formValues.licenseKey;

  // License Key 생성
  const handleGenerateKey = async () => {
    setIsGenerating(true);
    // 실제 백엔드 API는 여기에서 호출
    // const newKey = await api.generateServiceKey(formValues.serviceName);

    // 임시로 프론트에서 생성
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newKey = generateLicenseKey(formValues.serviceName);
    onChange({ ...formValues, licenseKey: newKey });
    setIsGenerating(false);
  };

  // Service Name 입력 검증
  const validateServiceName = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formValues.serviceName.trim()) {
      newErrors.serviceName = 'Service Name은 필수입니다';
    } else if (formValues.serviceName.length > 100) {
      newErrors.serviceName = 'Service Name은 100자 이하여야 합니다';
    } else if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(formValues.serviceName.toLowerCase())) {
      newErrors.serviceName = '소문자, 숫자, 하이픈만 사용 가능합니다 (시작/끝은 문자나 숫자)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 다음 버튼 클릭
  const handleNext = () => {
    if (!hasLicenseKey) {
      alert('License Key를 생성하세요');
      return;
    }
    if (validateServiceName()) {
      onNext();
    }
  };

  // 키 복사
  const handleCopyKey = () => {
    navigator.clipboard.writeText(formValues.licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Step 제목 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Service 정보 & License Key</h3>
        <p className="text-gray-600">서비스 이름을 입력하고 License Key를 생성하세요.</p>
      </div>

      {/* Service Name 입력 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Service Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formValues.serviceName}
          onChange={(e) => {
            onChange({ ...formValues, serviceName: e.target.value });
            if (errors.serviceName) setErrors({ ...errors, serviceName: undefined });
          }}
          onBlur={validateServiceName}
          placeholder="예: my-api-service"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.serviceName ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.serviceName && <p className="mt-1 text-sm text-red-600">{errors.serviceName}</p>}
        <p className="mt-2 text-xs text-gray-500">
          서비스를 식별하는 고유한 이름입니다. 대시보드에서 확인할 수 있습니다.
        </p>
      </div>

      {/* License Key 생성 섹션 */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">🔑 License Key 생성</h4>
            <p className="text-sm text-blue-700 mb-4">
              {hasLicenseKey
                ? '새로운 License Key를 생성하거나 기존 키를 사용할 수 있습니다.'
                : 'SDK가 데이터를 전송하기 위한 License Key를 생성합니다.'}
            </p>

            {hasLicenseKey ? (
              /* 이미 생성된 경우 */
              <div className="space-y-3">
                <div className="rounded-lg bg-white border border-blue-300 p-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">License Key</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-sm text-gray-900 break-all">
                      {showFullKey ? formValues.licenseKey : maskLicenseKey(formValues.licenseKey)}
                    </code>
                    <button
                      onClick={handleCopyKey}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                      title="복사"
                    >
                      {copiedKey ? (
                        <HiCheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <HiDocumentDuplicate className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <label className="mt-2 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showFullKey}
                      onChange={(e) => setShowFullKey(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-xs text-gray-600">전체 키 보기</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateKey}
                    disabled={isGenerating || !formValues.serviceName.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <HiArrowPath className="h-4 w-4" />
                    새로운 키 생성
                  </button>
                </div>
              </div>
            ) : (
              /* 아직 생성 안 된 경우 */
              <button
                onClick={handleGenerateKey}
                disabled={isGenerating || !formValues.serviceName.trim()}
                className="w-full px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <HiArrowPath className="h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <span>🔑</span>
                    License Key 생성
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 보안 정보 */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h4 className="font-medium text-amber-900 mb-2">⚠️ License Key 관리</h4>
        <ul className="space-y-2 text-sm text-amber-800">
          <li>• 생성된 키는 안전하게 보관하세요.</li>
          <li>• 키가 노출되면 즉시 새 키를 생성하세요.</li>
          <li>• 생성 직후에만 전체 내용을 확인할 수 있습니다.</li>
          <li>• 나중에 대시보드에서 키를 조회하고 관리할 수 있습니다.</li>
        </ul>
      </div>

      {/* Environment 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          실행 환경 (Deployment)
        </label>
        <select
          value={formValues.serviceEnvironment}
          onChange={(e) => onChange({ ...formValues, serviceEnvironment: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="development">Development</option>
          <option value="staging">Staging</option>
          <option value="production">Production</option>
        </select>
        <p className="mt-2 text-xs text-gray-500">
          서비스가 배포된 환경입니다. 대시보드에서 환경별로 데이터를 필터링할 수 있습니다.
        </p>
      </div>

      {/* 완료 상태 표시 */}
      {hasLicenseKey && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-start gap-3">
          <HiCheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-medium">License Key 생성 완료!</p>
            <p className="mt-1">다음 단계에서 설치 가이드를 확인하세요.</p>
          </div>
        </div>
      )}

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
          onClick={handleNext}
          disabled={!hasLicenseKey || !formValues.serviceName.trim()}
          className="flex-1 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          다음 단계로
        </button>
      </div>
    </div>
  );
}
