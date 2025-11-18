'use client';

import { useEffect, useMemo, type ComponentType } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import FrontendTraceGuide from '@/components/features/install/FrontendTrace';
import BackendLogGuide from '@/components/features/install/BackendLog';
import BackendTraceGuide from '@/components/features/install/BackendTrace';
import BackendLogTraceGuide from '@/components/features/install/BackendLogTrace';

const INSTALL_SCENARIOS = [
  'frontend-trace',
  'backend-log',
  'backend-trace',
  'backend-log-trace',
] as const;

type InstallScenario = (typeof INSTALL_SCENARIOS)[number];

const scenarioComponents: Record<InstallScenario, ComponentType> = {
  'frontend-trace': FrontendTraceGuide,
  'backend-log': BackendLogGuide,
  'backend-trace': BackendTraceGuide,
  'backend-log-trace': BackendLogTraceGuide,
};

const normalizeBoolean = (value: string | null): boolean => value === 'true';

const isInstallScenario = (value: string | null): value is InstallScenario =>
  !!value && (INSTALL_SCENARIOS as readonly string[]).includes(value);

const deriveScenarioFromFlags = (
  serviceType: string | null,
  collectLogs: boolean,
  collectTraces: boolean,
): InstallScenario | null => {
  if (serviceType === 'ui') {
    return 'frontend-trace';
  }

  if (serviceType === 'api') {
    if (collectLogs && collectTraces) return 'backend-log-trace';
    if (collectLogs) return 'backend-log';
    if (collectTraces) return 'backend-trace';
  }

  return null;
};

export default function InstallPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const scenario = useMemo(() => {
    const params = new URLSearchParams(searchParamsString);
    const forcedScenario = params.get('scenario') ?? params.get('variant');
    if (isInstallScenario(forcedScenario)) return forcedScenario;

    const serviceType = params.get('serviceType');
    const collectLogs = normalizeBoolean(params.get('collectLogs'));
    const collectTraces = normalizeBoolean(params.get('collectTraces'));

    return deriveScenarioFromFlags(serviceType, collectLogs, collectTraces);
  }, [searchParamsString]);

  useEffect(() => {
    if (!scenario) return;

    const params = new URLSearchParams(searchParamsString);
    const currentScenario = params.get('scenario') ?? params.get('variant');

    if (currentScenario !== scenario) {
      params.set('scenario', scenario);
      router.replace(`/services/install?${params.toString()}`, { scroll: false });
    }
  }, [scenario, searchParamsString, router]);

  if (!scenario) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <div className="max-w-lg space-y-4 rounded-2xl border border-dashed border-gray-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">
            Install Guide
          </p>
          <h1 className="text-2xl font-bold text-gray-900">설치 옵션을 찾을 수 없어요</h1>
          <p className="text-gray-600">
            서비스 생성 모달에서 Frontend / Backend 및 수집 옵션을 선택한 뒤 &ldquo;설치
            시작&rdquo;을 눌러주세요.
          </p>
          <div className="flex justify-center gap-3">
            <button
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
              onClick={() => router.push('/services')}
            >
              서비스 화면으로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ScenarioComponent = scenarioComponents[scenario];
  return <ScenarioComponent />;
}
