import { FrameworkData, FrameworkType } from '@/types/agent-install';
import { SiNodedotjs, SiNextdotjs, SiPython } from 'react-icons/si';

export const frameworksData: Record<FrameworkType, FrameworkData> = {
  nodejs: {
    icon: <SiNodedotjs className="w-12 h-12 text-green-600" />,
    iconLarge: <SiNodedotjs className="w-8 h-8 text-green-600" />,
    title: 'Node.js (NestJS, Express, Fastify)',
    description: 'OpenTelemetry SDK를 사용하여 Node.js 애플리케이션의 Traces와 Metrics를 수집',
    category: 'Backend',
    packageManager: 'npm',
    steps: [
      {
        title: '1. OpenTelemetry 패키지 설치',
        code: `npm install @opentelemetry/sdk-node \\
  @opentelemetry/auto-instrumentations-node \\
  @opentelemetry/exporter-trace-otlp-http \\
  @opentelemetry/exporter-metrics-otlp-http \\
  @opentelemetry/resources \\
  @opentelemetry/semantic-conventions`,
        language: 'bash',
      },
      {
        title: '2. otel-config.ts 파일 생성',
        description: '프로젝트 루트에 OpenTelemetry 설정 파일을 생성합니다.',
        code: `import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

// OTLP Exporter endpoint
const OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

// Configure trace exporter
const traceExporter = new OTLPTraceExporter({
  url: \`\${OTLP_ENDPOINT}/v1/traces\`,
  headers: {},
});

// Configure metric exporter
const metricExporter = new OTLPMetricExporter({
  url: \`\${OTLP_ENDPOINT}/v1/metrics\`,
  headers: {},
});

// Create metric reader
const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 10000, // Export every 10 seconds
});

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  serviceName: 'your-service-name',
  traceExporter,
  metricReader,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': { enabled: true },
      '@opentelemetry/instrumentation-express': { enabled: true },
      '@opentelemetry/instrumentation-nestjs-core': { enabled: true },
    }),
  ],
});

// Start SDK
sdk.start();
console.log('[OTEL] OpenTelemetry initialized successfully');

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('[OTEL] OpenTelemetry shut down successfully'))
    .catch((error) => console.error('[OTEL] Error shutting down OpenTelemetry', error))
    .finally(() => process.exit(0));
});

export default sdk;`,
        language: 'typescript',
      },
      {
        title: '3. main.ts (또는 index.ts)에서 임포트',
        description: '애플리케이션 진입점에서 반드시 제일 먼저 임포트해야 합니다.',
        code: `// 반드시 제일 먼저!
import './otel-config';

// 그 다음 나머지 임포트
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();`,
        language: 'typescript',
      },
      {
        title: '4. 환경변수 설정',
        description: 'Panopticon 수집 엔드포인트를 환경에 맞게 설정합니다.',
        code: `# .env 파일
# Panopticon 엔드포인트 (환경에 따라 선택)
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-panopticon-domain.com/otlp

# 환경별 예시:
# 프로덕션: https://api.panopticon.io/otlp
# 개발/로컬: http://localhost:4318
# Kubernetes: http://otel-collector:4318

# 서비스 이름 (필수)
OTEL_SERVICE_NAME=your-service-name`,
        language: 'bash',
      },
      {
        title: '5. 애플리케이션 실행 및 확인',
        description: '애플리케이션을 실행하면 자동으로 traces와 metrics가 수집됩니다.',
        code: `npm run start

# 로그에서 확인
# [OTEL] Initializing OpenTelemetry...
# [OTEL] OTLP Endpoint: http://your-otel-collector:4318
# [OTEL] OpenTelemetry initialized successfully`,
        language: 'bash',
      },
    ],
  },
  nextjs: {
    icon: <SiNextdotjs className="w-12 h-12 text-black" />,
    iconLarge: <SiNextdotjs className="w-8 h-8 text-black" />,
    title: 'Next.js',
    description: 'Next.js 내장 OpenTelemetry 지원을 사용하여 프론트엔드 Traces 수집',
    category: 'Frontend',
    packageManager: 'npm',
    steps: [
      {
        title: '1. OpenTelemetry 패키지 설치',
        code: `npm install @opentelemetry/sdk-node \\
  @opentelemetry/resources \\
  @opentelemetry/semantic-conventions \\
  @opentelemetry/exporter-trace-otlp-http`,
        language: 'bash',
      },
      {
        title: '2. instrumentation.ts 파일 생성',
        description: '프로젝트 루트(src와 같은 레벨)에 파일을 생성합니다.',
        code: `// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
    const { Resource } = await import('@opentelemetry/resources');
    const { SEMRESATTRS_SERVICE_NAME } = await import('@opentelemetry/semantic-conventions');

    const sdk = new NodeSDK({
      resource: new Resource({
        [SEMRESATTRS_SERVICE_NAME]: 'nextjs-frontend',
      }),
      traceExporter: new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
      }),
    });

    sdk.start();
  }
}`,
        language: 'typescript',
      },
      {
        title: '3. next.config.js 설정',
        description: 'Next.js에서 instrumentation을 활성화합니다.',
        code: `// next.config.js
module.exports = {
  experimental: {
    instrumentationHook: true,
  },
  // ... 나머지 설정
};`,
        language: 'javascript',
      },
      {
        title: '4. 환경변수 설정',
        description: 'Panopticon 수집 엔드포인트를 환경에 맞게 설정합니다.',
        code: `# .env.local
# Panopticon 엔드포인트 (환경에 따라 선택)
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-panopticon-domain.com/otlp

# 환경별 예시:
# 프로덕션: https://api.panopticon.io/otlp
# 개발/로컬: http://localhost:4318
# Kubernetes: http://otel-collector:4318

NEXT_RUNTIME=nodejs`,
        language: 'bash',
      },
      {
        title: '5. 애플리케이션 실행',
        code: `npm run dev

# 또는 프로덕션
npm run build
npm run start`,
        language: 'bash',
      },
    ],
  },
  python: {
    icon: <SiPython className="w-12 h-12 text-blue-600" />,
    iconLarge: <SiPython className="w-8 h-8 text-blue-600" />,
    title: 'Python (Django, FastAPI, Flask)',
    description: 'OpenTelemetry SDK를 사용하여 Python 애플리케이션의 Traces와 Metrics를 수집',
    category: 'Backend',
    packageManager: 'pip',
    steps: [
      {
        title: 'Coming Soon',
        description: 'Python 가이드는 준비 중입니다.',
      },
    ],
  },
};
