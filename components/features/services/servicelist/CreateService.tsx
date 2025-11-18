'use client';

import { useEffect, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';
import {
  SERVICE_ENVIRONMENT_OPTIONS,
  SERVICE_FRAMEWORK_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  getDefaultServiceFormValues,
} from '@/types/CreateService';
import type {
  CreateServiceFormValues,
  CreateServiceModalProps,
  ServiceType,
} from '@/types/CreateService';

export default function CreateServiceModal({
  open,
  mode = 'create',
  onClose,
  onSubmit,
  initialValues,
}: CreateServiceModalProps) {
  // 폼 입력값
  const [formValues, setFormValues] = useState<CreateServiceFormValues>(
    getDefaultServiceFormValues(initialValues),
  );

  // 모달이 열릴 때마다 form 값 초기화
  useEffect(() => {
    if (!open) return undefined;
    const raf = requestAnimationFrame(() => {
      setFormValues(getDefaultServiceFormValues(initialValues));
    });
    return () => cancelAnimationFrame(raf);
  }, [initialValues, open]);

  if (!open) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit?.(formValues);
  };

  // submit 버튼 비활성 조건
  const isSubmitDisabled =
    !formValues.serviceName || (!formValues.collectLogs && !formValues.collectTraces);

  // 현재 선택된 서비스 타입(UI/API)에 따라 프레임워크 목록 결정
  const availableFrameworks = SERVICE_FRAMEWORK_OPTIONS[formValues.serviceType];
  const selectedFramework =
    availableFrameworks.find((framework) => framework.value === formValues.framework) ??
    availableFrameworks[0];
  const runtimeDescription = selectedFramework
    ? `선택하신 ${selectedFramework.label} 프레임워크에 맞는 ${selectedFramework.runtime} 런타임이 자동으로 설정됩니다.`
    : '선택하신 프레임워크에 맞는 런타임이 자동으로 설정됩니다.';
  const isApiService = formValues.serviceType === 'api';

  // 서비스 종류(UI/API) 변경 핸들러
  const handleServiceTypeChange = (type: ServiceType) => {
    setFormValues((prev) => ({
      ...prev,
      serviceType: type,
      framework: SERVICE_FRAMEWORK_OPTIONS[type][0]?.value ?? prev.framework,
      collectLogs: type === 'api',
      collectTraces: type === 'ui' ? true : prev.collectTraces,
    }));
  };

  // 프레임워크 변경 핸들러
  const handleFrameworkChange = (framework: string) => {
    setFormValues((prev) => ({ ...prev, framework }));
  };

  // 실행환경 변경 핸들러
  const handleEnvironmentChange = (environment: string) => {
    setFormValues((prev) => ({ ...prev, environment }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
      {/* 모달 컨테이너 */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <p className="text-xs text-blue-500 font-semibold">Service List</p>
            <h2 className="text-xl text-gray-900">
              {mode === 'edit' ? '서비스 정보 수정' : '서비스 생성'}
            </h2>
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            aria-label="닫기"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* form 영역 */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* 서비스 종류 선택 (UI / API) */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                서비스 종류 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SERVICE_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleServiceTypeChange(option.value)}
                    aria-pressed={formValues.serviceType === option.value}
                    className={`w-full rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                      formValues.serviceType === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 서비스 이름 입력 */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                서비스 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formValues.serviceName}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, serviceName: event.target.value }))
                }
                placeholder="예: user-service"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                입력한 서비스 이름은 이후 모든 화면에서 서비스 식별용으로 사용됩니다.{' '}
              </p>
            </div>

            {/* 프레임워크 선택 */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                프레임워크 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availableFrameworks.map((framework) => (
                  <button
                    key={framework.value}
                    type="button"
                    onClick={() => handleFrameworkChange(framework.value)}
                    aria-pressed={formValues.framework === framework.value}
                    className={`w-full rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                      formValues.framework === framework.value
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {framework.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 런타임 안내 (자동 설정) */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-800">런타임(Runtime)</p>
              <p className="mt-1 text-xs text-gray-600">{runtimeDescription}</p>
            </div>

            {/* 실행환경 선택 */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                실행환경 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SERVICE_ENVIRONMENT_OPTIONS.map((environment) => (
                  <button
                    key={environment.value}
                    type="button"
                    onClick={() => handleEnvironmentChange(environment.value)}
                    aria-pressed={formValues.environment === environment.value}
                    className={`w-full rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                      formValues.environment === environment.value
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {environment.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 수집 대상 선택 (Logs, Traces) */}
            <div>
              <label className="block text-sm text-gray-700 mb-3">
                수집 데이터 종류 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {isApiService && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formValues.collectLogs}
                      onChange={(event) =>
                        setFormValues((prev) => ({ ...prev, collectLogs: event.target.checked }))
                      }
                      className="w-5 h-5 border-gray-300 rounded accent-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Log</span>
                  </label>
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formValues.collectTraces}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, collectTraces: event.target.checked }))
                    }
                    className="w-5 h-5 border-gray-300 rounded accent-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Trace</span>
                </label>

                {!isApiService && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                    브라우저 기반 UI 서비스는 로그(Log) 수집을 지원하지 않습니다.
                  </div>
                )}
              </div>
            </div>

            {/* 안내 박스 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm text-blue-900 mb-2">📦 에이전트 설치 안내</h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                서비스 생성이 완료되면 설치 가이드가 제공됩니다.
                <br />
                안내에 따라 에이전트를 설치해 데이터 수집을 시작하세요.
              </p>
            </div>
          </div>

          {/* 제출 버튼 영역 */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="px-6 py-2.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'edit' ? '변경 저장' : '생성하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
