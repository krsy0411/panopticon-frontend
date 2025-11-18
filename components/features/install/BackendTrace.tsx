'use client';

import { PiGraphLight } from 'react-icons/pi';
import InstallGuideLayout from './common/InstallGuideLayout';

type StepSection = {
  heading?: string;
  description?: string;
  code: string;
  language?: string;
};

type ScenarioStep = {
  subtitle: string;
  title: string;
  description: string;
  meta?: string;
  sections: StepSection[];
  checklist?: string[];
};

const steps: ScenarioStep[] = [
  // ----------------------------------------------------
  // STEP 1
  // ----------------------------------------------------
  {
    subtitle: 'Step 1 of 4',
    title: 'OpenTelemetry Node SDK 설치',
    description:
      'HTTP / Express / Postgres 요청을 자동으로 계측하기 위해 OpenTelemetry Node SDK를 설치합니다.',
    meta: '작업 유형: 🖥️ 터미널 명령어 실행 (코드 파일 수정 없음)',
    sections: [
      {
        code: `# backend 디렉터리에서 실행

npm install --save \\
  @opentelemetry/api@^1.9.0 \\
  @opentelemetry/sdk-node@^0.208.0 \\
  @opentelemetry/auto-instrumentations-node@^0.67.0 \\
  @opentelemetry/exporter-trace-otlp-http@^0.208.0 \\
  @opentelemetry/resources@^2.2.0 \\
  @opentelemetry/semantic-conventions@^1.38.0`,
        language: 'bash',
      },
    ],
  },

  // ----------------------------------------------------
  // STEP 2
  // ----------------------------------------------------
  {
    subtitle: 'Step 2 of 4',
    title: 'tracing.ts 파일 생성 & NodeSDK 초기화',
    description:
      '애플리케이션 시작 시 한 번만 NodeSDK를 초기화하여 생성된 Trace를 Panopticon Ingest 서버로 전송합니다.',
    meta: '작업 유형: 📄 새 파일 생성',
    sections: [
      {
        code: `// 파일 위치 예시: backend/src/tracing.ts

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from '@opentelemetry/semantic-conventions';
import type { ExpressLayerType } from "@opentelemetry/instrumentation-express";

const serviceName =
  process.env.OTEL_SERVICE_NAME || 'backend-service';
const environment =
  process.env.NODE_ENV || 'development';
const tracesEndpoint =
  process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
  'http://host.docker.internal:3005/producer/v1/traces';

const resource = new Resource({
  [SEMRESATTRS_SERVICE_NAME]: serviceName,
  [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: environment,
});

const traceExporter = new OTLPTraceExporter({ url: tracesEndpoint });

const sdk = new NodeSDK({
  resource,
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingRequestHook: (req: any) =>
          req.url?.includes('/health') || req.url?.includes('/ready'),
      },
      "@opentelemetry/instrumentation-express": {
        ignoreLayersType: ["middleware"] as ExpressLayerType[],
      },
    }),
  ],
});

sdk.start().then(() => {
  console.log('[OTEL] Tracing initialized');
});

const shutdown = async () => {
  await sdk.shutdown();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
`,
        language: 'typescript',
      },
    ],
  },

  // ----------------------------------------------------
  // STEP 3
  // ----------------------------------------------------
  {
    subtitle: 'Step 3 of 4',
    title: 'main.ts에서 tracing.ts를 가장 먼저 import',
    description:
      'NestJS 애플리케이션이 시작되기 전에 OTEL SDK가 초기화되도록 main.ts 최상단에서 ./tracing 을 import 합니다.',
    meta: '작업 유형: ✏️ 기존 파일 수정',
    sections: [
      {
        code: `// backend/src/main.ts
import './tracing';  // ✅ 반드시 가장 위에서 import 해야 합니다.

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 프론트에서 전달되는 traceparent 헤더 허용
  app.enableCors({
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'traceparent',
      'tracestate',
    ],
    exposedHeaders: ['traceparent', 'tracestate'],
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
`,
        language: 'typescript',
      },
    ],
  },

  // ----------------------------------------------------
  // STEP 4
  // ----------------------------------------------------
  {
    subtitle: 'Step 4 of 4',
    title: '환경 변수 설정 & Trace 수집 확인',
    description:
      '서비스 이름과 OTLP 엔드포인트를 환경 변수로 설정한 후,\n실제 API를 호출하여 Trace가 정상적으로 수집되는지 확인합니다.',
    meta: '작업 유형: 📝 환경 변수 설정 + 서버 재시작',
    sections: [
      {
        code: `# backend/.env 또는 docker/.env

OTEL_SERVICE_NAME=your-backend-service
NODE_ENV=production
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://api.jungle-panopticon.cloud/producer/v1/traces`,
        language: 'bash',
      },
    ],
    checklist: [
      '백엔드 서버를 재시작합니다.\n   - Docker: `docker compose restart backend`',
      '백엔드 API를 1회 이상 호출합니다. (프론트엔드 / Postman / curl 모두 가능)',
      'Panopticon 대시보드에서\n   **백엔드 서비스 이름**으로 Trace가 생성되는지 확인합니다.',
    ],
  },
];

// ------------------------------------------------------------
// Layout 적용
// ------------------------------------------------------------
export default function BackendTraceGuide() {
  return <InstallGuideLayout steps={steps} icon={<PiGraphLight className="h-10 w-10" />} />;
}
