/**
 * Agent 설치 흐름에서 사용되는 타입들
 */

export type AgentRuntime = 'nodejs' | 'python' | 'java' | 'go' | 'php' | 'dotnet' | 'ruby';

export interface Agent {
  id: AgentRuntime;
  label: string;
  description: string;
  icon?: string;
  frameworks: Framework[];
  isComingSoon?: boolean;
}

export interface Framework {
  id: string;
  label: string;
  runtime: AgentRuntime;
}

export type InstrumentationMethod = 'auto' | 'manual' | 'container';

export type RuntimeEnvironment =
  | 'docker'
  | 'kubernetes'
  | 'ecs'
  | 'lambda'
  | 'linux-host'
  | 'windows';

export type TelemetryType = 'traces' | 'metrics' | 'logs' | 'profiling';

export interface AgentSetupFormValues {
  // Step 1: Language 선택
  agentRuntime: AgentRuntime;
  framework: string;

  // Step 2: Runtime Environment 선택
  runtimeEnvironment: RuntimeEnvironment;

  // Step 3: Instrumentation Method 선택
  instrumentationMethod: InstrumentationMethod;

  // Step 4: Telemetry Type & Service Info
  telemetryTypes: TelemetryType[];
  licenseKey: string;
  serviceName: string;
  serviceEnvironment: string;

  // Step 5: Validation - 자동으로 설정됨
  validationStatus?: 'pending' | 'success' | 'failed';
}

export interface AgentSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (values: AgentSetupFormValues) => void;
}
