'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiCheckCircle, HiXCircle, HiArrowPath } from 'react-icons/hi2';
import type { Agent, AgentSetupFormValues } from '@/types/agent-install';

interface ValidationStepProps {
  agent: Agent;
  formValues: AgentSetupFormValues;
  onPrev?: () => void;
}

type ValidationStatus = 'idle' | 'validating' | 'success' | 'failed';

export default function ValidationStep({ agent, formValues, onPrev }: ValidationStepProps) {
  const router = useRouter();
  const [status, setStatus] = useState<ValidationStatus>('idle');
  const [message, setMessage] = useState<string>('');

  // TODO: API 서버 복구 후 useQuery 활성화
  // import { useQuery } from '@tanstack/react-query';
  // import { getServices } from '@/src/api/apm';
  // import { useEffect } from 'react';
  // const { data: servicesData, isLoading, error } = useQuery({
  //   queryKey: ['services'],
  //   queryFn: getServices,
  //   enabled: status === 'success',
  //   refetchInterval: 5000, // 5초마다 폴링
  //   select: (response) => {
  //     if (!response?.services) return null;
  //     const serviceExists = response.services.some(
  //       (service) => service.service_name === formValues.serviceName,
  //     );
  //     return serviceExists ? response : null;
  //   },
  // });

  // useEffect(() => {
  //   if (servicesData) {
  //     router.push('/services');
  //   }
  // }, [servicesData, router]);

  const handleComplete = () => {
    // 임시: 바로 /services로 라우팅
    router.push('/services');
  };

  const handleValidate = async () => {
    setStatus('validating');
    setMessage('SDK 신호를 감지 중입니다...');

    // 실제로는 백엔드 API를 호출합니다
    // 여기서는 2초 후 성공으로 처리 (시뮬레이션)
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3; // 70% 성공률
      if (isSuccess) {
        setStatus('success');
        setMessage('SDK가 성공적으로 설치되고 신호를 보내고 있습니다!');
      } else {
        setStatus('failed');
        setMessage('아직 신호를 받지 못했습니다. 설치 단계를 다시 확인해주세요.');
      }
    }, 2000);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">SDK 신호 감지</h3>
        <p className="text-gray-600">SDK가 올바르게 설치되었는지 확인합니다.</p>
      </div>

      {/* 현재 설정 요약 */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h4 className="font-medium text-gray-900 mb-3">현재 설정</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Runtime:</span>
            <span className="font-medium text-gray-900">{agent.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Framework:</span>
            <span className="font-medium text-gray-900">
              {agent.frameworks.find((f) => f.id === formValues.framework)?.label}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Service Name:</span>
            <span className="font-medium text-gray-900">{formValues.serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Instrumentation:</span>
            <span className="font-medium text-gray-900 capitalize">
              {formValues.instrumentationMethod}
            </span>
          </div>
        </div>
      </div>

      {/* 검증 상태 */}
      <div className="rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col items-center text-center">
          {status === 'idle' && (
            <>
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <HiArrowPath className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-6">검증을 시작하려면 아래 버튼을 클릭하세요.</p>
            </>
          )}

          {status === 'validating' && (
            <>
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 animate-pulse">
                <HiArrowPath className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <HiCheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-green-900 mb-2">신호 감지됨!</h4>
              <p className="text-green-700 mb-4">{message}</p>
              <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                <p className="font-medium mb-2">다음 단계:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>대시보드에서 서비스를 확인할 수 있습니다</li>
                  <li>트레이스, 로그, 메트릭이 수집되기 시작합니다</li>
                </ul>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <HiXCircle className="h-8 w-8 text-red-600" />
              </div>
              <h4 className="text-lg font-semibold text-red-900 mb-2">신호 감지 실패</h4>
              <p className="text-red-700 mb-4">{message}</p>
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                <p className="font-medium mb-2">확인 사항:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>설치 가이드의 모든 단계를 완료했는지 확인</li>
                  <li>License Key를 정확히 입력했는지 확인</li>
                  <li>애플리케이션을 재시작했는지 확인</li>
                  <li>네트워크 연결을 확인</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        {onPrev && status === 'idle' && (
          <button
            onClick={onPrev}
            className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            이전 단계로
          </button>
        )}

        {status !== 'validating' && (
          <button
            onClick={handleValidate}
            className="flex-1 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {status === 'idle' ? '검증 시작' : '다시 검증'}
          </button>
        )}

        {status === 'success' && (
          <button
            onClick={handleComplete}
            className="flex-1 px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            완료 및 대시보드로 이동
          </button>
        )}

        {status === 'failed' && (
          <button
            onClick={handleComplete}
            className="flex-1 px-6 py-3 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
          >
            나중에 검증 (서비스 생성)
          </button>
        )}
      </div>

      {/* 도움말 */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 팁</h4>
        <p className="text-sm text-blue-700">
          검증이 실패했다면 설치 가이드를 다시 확인하거나 대시보드 설정에서 연결 상태를
          확인해보세요.
        </p>
      </div>
    </div>
  );
}
