'use client';

import { useRouter } from 'next/navigation';
import { platformsData } from './platforms';
import { frameworksData } from './frameworks';
import { PlatformType, FrameworkType } from '@/types/agent-install';

export default function InstallPage() {
  const router = useRouter();

  const handlePlatformSelect = (platform: PlatformType) => {
    router.push(`/install/${platform}`);
  };

  const handleFrameworkSelect = (framework: FrameworkType) => {
    router.push(`/install/${framework}`);
  };

  const platformNames: Record<PlatformType, string> = {
    kubernetes: 'Kubernetes',
    macos: 'macOS',
    opentelemetry: 'OpenTelemetry',
    docker: 'Docker',
    ecs: 'ECS',
    fluentbit: 'Fluent Bit',
  };

  const frameworkNames: Record<FrameworkType, string> = {
    nodejs: 'Node.js',
    nextjs: 'Next.js',
    python: 'Python',
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Install Panopticon Agent
          </h1>
          <p className="text-lg text-gray-600">설치할 에이전트를 선택하세요</p>
        </div>

        {/* Installation Flow */}
        <div className="mb-16 bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">설치 플로우</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-3xl font-bold text-green-600">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Application SDK 설치</h3>
              <p className="text-sm text-gray-600">
                애플리케이션 코드에 OpenTelemetry SDK를 설치하여 Traces와 Metrics 생성
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">
                Infrastructure Agents 배포
              </h3>
              <p className="text-sm text-gray-600">
                OTel Collector와 Fluent Bit을 배포하여 데이터 수집
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-3xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Panopticon 연결</h3>
              <p className="text-sm text-gray-600">
                수집된 데이터를 Panopticon 엔드포인트로 전송하고 대시보드에서 확인
              </p>
            </div>
          </div>
        </div>

        {/* Application Monitoring Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Application Monitoring
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            애플리케이션 코드에 OpenTelemetry SDK를 설치하여 Traces와 Metrics를 수집합니다
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {Object.entries(frameworksData).map(([frameworkKey, framework]) => (
              <button
                key={frameworkKey}
                onClick={() => handleFrameworkSelect(frameworkKey as FrameworkType)}
                className="p-6 rounded-xl border-2 transition-all duration-200 text-black hover:border-green-500 hover:shadow-lg hover:cursor-pointer bg-white"
              >
                <div className="flex flex-col items-center gap-4">
                  {framework.icon}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {frameworkNames[frameworkKey as FrameworkType]}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {framework.description.split('\n').map((line, idx) => (
                        <span key={idx}>
                          {line}
                          {idx < framework.description.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Infrastructure Agents Section */}
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Infrastructure Agents
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            인프라 레벨에서 로그, 메트릭, 트레이스를 수집하는 에이전트를 배포합니다
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {Object.entries(platformsData).map(([platformKey, platform]) => (
              <button
                key={platformKey}
                onClick={() => handlePlatformSelect(platformKey as PlatformType)}
                className="p-6 rounded-xl border-2 transition-all duration-200 text-black hover:border-blue-500 hover:shadow-lg hover:cursor-pointer bg-white"
              >
                <div className="flex flex-col items-center gap-4">
                  {platform.icon}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {platformNames[platformKey as PlatformType]}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {platform.description.split('\n').map((line, idx) => (
                        <span key={idx}>
                          {line}
                          {idx < platform.description.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/main')}
            className="text-gray-600 hover:text-gray-900 underline text-sm"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
