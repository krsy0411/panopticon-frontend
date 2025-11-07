'use client';

import { useRouter } from 'next/navigation';
import Logo from '@/components/icons/Logo';
import { platformsData, PlatformType } from './platforms';

export default function AgentInstallPage() {
  const router = useRouter();

  const handlePlatformSelect = (platform: PlatformType) => {
    router.push(`/agent-install/${platform}`);
  };

  const platformNames: Record<PlatformType, string> = {
    kubernetes: 'Kubernetes',
    macos: 'macOS',
    opentelemetry: 'OpenTelemetry',
    docker: 'Docker',
    ecs: 'ECS',
  };

  const groupedPlatforms = {
    'Container Platform': ['kubernetes', 'docker', 'ecs'] as PlatformType[],
    'Host based': ['macos'] as PlatformType[],
    Monitoring: ['opentelemetry'] as PlatformType[],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Install Panopticon Agent
          </h1>
          <p className="text-lg text-gray-600">플랫폼을 선택하고 에이전트를 설치하세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(groupedPlatforms).map(([category, platforms]) => (
            <div key={category} className="flex flex-col gap-6">
              <h2 className="text-xl font-semibold text-center text-black">{category}</h2>
              {platforms.map((platformKey) => {
                const platform = platformsData[platformKey];
                return (
                  <button
                    key={platformKey}
                    onClick={() => handlePlatformSelect(platformKey)}
                    className="p-6 rounded-xl border-2 transition-all duration-200 text-black hover:border-blue-500 hover:shadow-lg"
                  >
                    <div className="flex flex-col items-center gap-4">
                      {platform.icon}
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {platformNames[platformKey]}
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
                );
              })}
            </div>
          ))}
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
