'use client';

import { useRouter } from 'next/navigation';
import { IoArrowBack } from 'react-icons/io5';
import { FrameworkData } from '@/types/agent-install';
import { CopyableCodeBlock } from './CopyableCodeBlock';

type Props = {
  framework: FrameworkData;
};

export default function FrameworkInstallClient({ framework }: Props) {
  const router = useRouter();

  const handleBack = () => router.push('/install');

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-cyan-50">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <button
          onClick={handleBack}
          className="mb-8 flex items-center gap-2 text-blue-600 transition hover:text-blue-700"
        >
          <IoArrowBack className="h-5 w-5" />
          <span>다른 프레임워크 선택</span>
        </button>

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          {framework.iconLarge}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{framework.title}</h1>
            <p className="mt-2 text-gray-600">{framework.description}</p>
          </div>
        </div>

        {/* Installation Steps */}
        <div className="space-y-8">
          {framework.steps.map((step, index) => (
            <div key={index} className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">{step.title}</h2>

              {step.description && <p className="mb-4 text-gray-600">{step.description}</p>}

              {step.code && <CopyableCodeBlock code={step.code} />}
            </div>
          ))}
        </div>

        {/* Next Steps */}
        <div className="mt-12 space-y-6">
          {/* Step 1 완료 */}
          <div className="rounded-xl bg-green-50 p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              ✓ Step 1 완료: Application SDK 설치
            </h3>
            <p className="text-green-800">
              {framework.title} SDK 설치가 완료되었습니다. 애플리케이션이 Traces와 Metrics를 생성할
              준비가 되었습니다.
            </p>
          </div>

          {/* Step 2 안내 */}
          <div className="rounded-xl bg-blue-50 p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Step 2: Infrastructure Agents 설치
            </h3>
            <p className="mb-4 text-blue-800">
              애플리케이션이 생성한 데이터를 수집하고 Panopticon으로 전송하려면 인프라 에이전트가
              필요합니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-blue-800 mb-4">
              <li>
                <strong>OTel Collector</strong>: Traces와 Metrics를 수집하여 Panopticon으로 전송
              </li>
              <li>
                <strong>Fluent Bit</strong>: 컨테이너 로그를 수집하여 Panopticon으로 전송
              </li>
            </ul>
            <button
              onClick={() => router.push('/install')}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
            >
              Infrastructure 설치 가이드로 이동
            </button>
          </div>

          {/* 환경변수 참고 */}
          <div className="rounded-xl bg-gray-50 p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">중요: 엔드포인트 설정</h3>
            <p className="text-gray-700 mb-3">
              <code className="bg-gray-200 px-2 py-1 rounded text-sm">
                OTEL_EXPORTER_OTLP_ENDPOINT
              </code>
              는 Panopticon 데이터 수집 서버 주소입니다.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                • <strong>프로덕션:</strong> https://api.panopticon.io/otlp
              </p>
              <p>
                • <strong>개발/로컬:</strong> http://localhost:4318
              </p>
              <p>
                • <strong>Kubernetes:</strong> http://otel-collector:4318
              </p>
            </div>
          </div>

          {/* 대시보드 링크 */}
          <div className="text-center">
            <button
              onClick={() => router.push('/main')}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-gray-700 transition hover:bg-gray-50"
            >
              대시보드로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
