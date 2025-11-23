'use client';

import { useMemo, type ComponentType } from 'react';
import { useSearchParams } from 'next/navigation';

import FrontendTraceGuide from '@/components/features/install/FrontendTrace';
import BackendLogGuide from '@/components/features/install/BackendLog';
import BackendTraceGuide from '@/components/features/install/BackendTrace';
import BackendLogTraceGuide from '@/components/features/install/BackendLogTrace';
import AgentSelectionPage from '@/components/features/agent-install/AgentSelectionPage';

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

  // 기존 설치 가이드가 있는 경우
  if (scenario) {
    const ScenarioComponent = scenarioComponents[scenario];
    return <ScenarioComponent />;
  }

  // 새로운 Agent 선택 페이지
  return <AgentSelectionPage />;
}
