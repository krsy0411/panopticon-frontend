import type {
  Agent,
  AgentSetupFormValues,
  TelemetryType,
  RuntimeEnvironment,
  InstrumentationMethod,
} from '@/types/agent-install';

// Agent 목록
export const AGENTS: Agent[] = [
  {
    id: 'nodejs',
    label: 'Node.js',
    description: 'JS / TS 기반 백엔드 서비스',
    frameworks: [
      { id: 'express', label: 'Express', runtime: 'nodejs' },
      { id: 'nestjs', label: 'NestJS', runtime: 'nodejs' },
      { id: 'nextjs', label: 'Next.js', runtime: 'nodejs' },
      { id: 'fastify', label: 'Fastify', runtime: 'nodejs' },
    ],
  },
  {
    id: 'python',
    label: 'Python',
    description: 'Python 기반 백엔드 서비스',
    frameworks: [
      { id: 'fastapi', label: 'FastAPI', runtime: 'python' },
      { id: 'django', label: 'Django', runtime: 'python' },
      { id: 'flask', label: 'Flask', runtime: 'python' },
    ],
  },
  {
    id: 'java',
    label: 'Java',
    description: 'Java 기반 백엔드 서비스',
    frameworks: [
      { id: 'springboot', label: 'Spring Boot', runtime: 'java' },
      { id: 'quarkus', label: 'Quarkus', runtime: 'java' },
    ],
    isComingSoon: true,
  },
  {
    id: 'go',
    label: 'Go',
    description: 'Go 기반 백엔드 서비스',
    frameworks: [
      { id: 'gin', label: 'Gin', runtime: 'go' },
      { id: 'echo', label: 'Echo', runtime: 'go' },
    ],
    isComingSoon: true,
  },
  {
    id: 'php',
    label: 'PHP',
    description: 'PHP 기반 백엔드 서비스',
    frameworks: [
      { id: 'laravel', label: 'Laravel', runtime: 'php' },
      { id: 'symfony', label: 'Symfony', runtime: 'php' },
    ],
    isComingSoon: true,
  },
  {
    id: 'dotnet',
    label: '.NET',
    description: '.NET 기반 백엔드 서비스',
    frameworks: [{ id: 'aspnetcore', label: 'ASP.NET Core', runtime: 'dotnet' }],
    isComingSoon: true,
  },
  {
    id: 'ruby',
    label: 'Ruby',
    description: 'Ruby 기반 백엔드 서비스',
    frameworks: [
      { id: 'rails', label: 'Rails', runtime: 'ruby' },
      { id: 'sinatra', label: 'Sinatra', runtime: 'ruby' },
    ],
    isComingSoon: true,
  },
];

export const INSTRUMENTATION_METHODS: {
  id: InstrumentationMethod;
  label: string;
  description: string;
}[] = [
  {
    id: 'auto',
    label: 'Auto Instrumentation',
    description: '자동으로 라이브러리를 감지하여 계측합니다',
  },
];

export const RUNTIME_ENVIRONMENTS: {
  id: RuntimeEnvironment;
  label: string;
  description: string;
}[] = [
  { id: 'docker', label: 'Docker', description: 'Docker 컨테이너 환경' },
  { id: 'linux-host', label: 'Linux Host', description: 'Linux VM 또는 베어메탈' },
  { id: 'windows', label: 'Windows', description: 'Windows 서버' },
];

export const TELEMETRY_TYPES: {
  id: TelemetryType;
  label: string;
  description: string;
  default?: boolean;
}[] = [
  {
    id: 'traces',
    label: 'Traces',
    description: 'HTTP 요청, 외부 API 호출, DB 쿼리 추적',
    default: true,
  },
  { id: 'logs', label: 'Logs', description: '애플리케이션 로그 수집', default: false },
];

export const getDefaultAgentSetupValues = (
  overrides?: Partial<AgentSetupFormValues>,
): AgentSetupFormValues => {
  return {
    agentRuntime: overrides?.agentRuntime ?? 'nodejs',
    framework: overrides?.framework ?? AGENTS[0].frameworks[0].id,
    runtimeEnvironment: overrides?.runtimeEnvironment ?? 'docker',
    instrumentationMethod: overrides?.instrumentationMethod ?? 'auto',
    telemetryTypes: overrides?.telemetryTypes ?? ['traces'],
    licenseKey: overrides?.licenseKey ?? '',
    serviceName: overrides?.serviceName ?? '',
    serviceEnvironment: overrides?.serviceEnvironment ?? 'development',
    validationStatus: 'pending',
  };
};
