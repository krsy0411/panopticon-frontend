'use client';

import { PiStackLight } from 'react-icons/pi';
import InstallGuideLayout from './common/InstallGuideLayout';

// 타입 정의
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

//
// Steps 정의 (Type D – Log + Trace 풀옵션)
//
const steps: ScenarioStep[] = [
  // ----------------------------------------------------
  // STEP 1
  // ----------------------------------------------------
  {
    subtitle: 'Step 1 of 4',
    title: 'OpenTelemetry Node SDK 설치',
    description: 'Trace를 수집하기 위해 OpenTelemetry Node SDK를 설치합니다.',
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
    title: 'tracing.ts와 StructuredLogger 추가',
    description:
      '애플리케이션 시작 시 한 번만 OTEL NodeSDK를 초기화하여 생성된 Trace를 Panopticon Ingest 서버로 전송합니다.',
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
process.on('SIGINT', shutdown);`,
        language: 'typescript',
      },
    ],
  },

  // ----------------------------------------------------
  // STEP 3
  // ----------------------------------------------------
  {
    subtitle: 'Step 3 of 4',
    title: '구조화 로거 + LoggerModule + main.ts 설정',
    description:
      '백엔드 컨테이너에서 출력된 JSON 로그를 Panopticon으로 전송하기 위해\nFluent Bit 설정 파일과 docker-compose 로그 드라이버를 구성합니다.',
    meta: '작업 유형: 📄 새 파일 생성 / ✏️ 기존 파일 수정',

    sections: [
      // -------------------------------
      // 3-1. 구조화 로거 파일 생성
      // -------------------------------
      {
        heading: '3-1. StructuredLogger 생성',
        description: '작업 유형: 📄 새 파일 생성',
        code: `// 파일 위치 예시: backend/src/logger/structured-logger.service.ts

import { Injectable, LoggerService } from '@nestjs/common';
import { trace } from '@opentelemetry/api';

interface StructuredLogData {
  type: 'log';
  timestamp: string;
  service_name: string;
  environment: string;
  level: string;
  message: string;
  trace_id?: string;
  span_id?: string;
  [key: string]: any;
}

@Injectable()
export class StructuredLogger implements LoggerService {
  private readonly serviceName =
    process.env.SERVICE_NAME || 'backend-service';
  private readonly environment =
    process.env.NODE_ENV || 'development';

  private getTraceContext() {
    const span = trace.getActiveSpan();
    if (!span) return {};
    const ctx = span.spanContext();
    return { trace_id: ctx.traceId, span_id: ctx.spanId };
  }

  private format(level: string, message: any, meta?: Record<string, any>) {
    const payload: StructuredLogData = {
      type: 'log',
      timestamp: new Date().toISOString(),
      service_name: this.serviceName,
      environment: this.environment,
      level: level.toUpperCase(),
      message: String(message),
      ...this.getTraceContext(),
      ...meta,
    };

    console.log(JSON.stringify(payload));
  }

  log(message: any, meta?: any) { this.format('info', message, meta); }
  error(message: any, traceStr?: string, meta?: any) { this.format('error', message, { trace: traceStr, ...meta }); }
  warn(message: any, meta?: any) { this.format('warn', message, meta); }
  debug(message: any, meta?: any) { this.format('debug', message, meta); }
  verbose(message: any, meta?: any) { this.format('verbose', message, meta); }

  logHttp(params: { method: string; path: string; status: number; durationMs: number; ip?: string }) {
    const level =
      params.status >= 500 ? 'error'
      : params.status >= 400 ? 'warn'
      : 'info';

    this.format(level, \`\${params.method} \${params.path}\`, {
      http_method: params.method,
      http_path: params.path,
      http_status_code: params.status,
      duration_ms: params.durationMs,
      client_ip: params.ip,
    });
  }
}`,
        language: 'typescript',
      },

      // -------------------------------
      // 3-2. LoggerModule 파일 생성
      // -------------------------------
      {
        heading: '3-2. LoggerModule 생성',
        description: '작업 유형: 📄 새 파일 생성',
        code: `// 파일 위치 예시: backend/src/logger/logger.module.ts

import { Global, Module } from '@nestjs/common';
import { StructuredLogger } from './structured-logger.service';

@Global()
@Module({
  providers: [StructuredLogger],
  exports: [StructuredLogger],
})
export class LoggerModule {}`,
        language: 'typescript',
      },

      // -------------------------------
      // 3-3. AppModule 수정
      // -------------------------------
      {
        heading: '3-3. AppModule 수정',
        description: '작업 유형: ✏️ 기존 파일 수정',
        code: `// [수정] backend/src/app.module.ts 에 LoggerModule을 추가합니다.
// - 기존 imports 배열에 LoggerModule을 한 줄만 추가합니다.

import { Module } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
// ... 다른 import 들

@Module({
  imports: [
    // ... 기존 모듈들
    LoggerModule, // [추가] 전역 Logger 모듈
  ],
  // controllers, providers는 기존 그대로 유지
})
export class AppModule {}
`,
        language: 'typescript',
      },

      // -------------------------------
      // 3-4. main.ts 수정
      // -------------------------------
      {
        heading: '3-4. main.ts에서 로거 + tracing.ts 적용',
        description: '작업 유형: ✏️ 기존 파일 수정',
        code: `// [수정] backend/src/main.ts 에서 StructuredLogger를 애플리케이션 로거로 사용합니다.
// - HTTP 요청에 대해 logHttp()를 호출하는 미들웨어를 추가합니다.

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StructuredLogger } from './logger/structured-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // 부트스트랩 중 로그도 StructuredLogger로 버퍼링합니다.
  });

  const structuredLogger = app.get(StructuredLogger);
  app.useLogger(structuredLogger);

  // [추가] HTTP 요청 로깅 미들웨어
  app.use((req: any, res: any, next: any) => {
    const start = process.hrtime.bigint();
    const { method, originalUrl, ip } = req;

    res.on('finish', () => {
      // 헬스 체크 엔드포인트는 로그 노이즈를 줄이기 위해 제외합니다.
      if (originalUrl === '/health') return;

      const elapsed =
        Number(process.hrtime.bigint() - start) / 1_000_000;
      const durationMs = Math.round(elapsed * 100) / 100;

      structuredLogger.logHttp({
        method,
        path: originalUrl,
        status: res.statusCode,
        durationMs,
        ip,
      });
    });

    next();
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();`,
        language: 'typescript',
      },
    ],
  },

  // ----------------------------------------------------
  // STEP 4
  // ----------------------------------------------------
  {
    subtitle: 'Step 4 of 4',
    title: '환경 변수 설정 & Trace/Log 수집 확인',
    description:
      '동일한 서비스 이름으로 Trace와 Log를 함께 수집하기 위해\n환경 변수를 설정하고 실제 요청을 보내어 Trace와 Log가 모두 수집되는지 확인합니다.',
    meta: '작업 유형: 📄 새 파일 생성 / ✏️ 기존 파일 수정',

    sections: [
      // -----------------------------------
      // 4-1. Fluent Bit 설정 파일 생성
      // -----------------------------------
      {
        heading: '4-1. Fluent Bit 설정 파일 추가',
        description: '작업 유형: 📄 새 파일 생성',
        code: `# 파일 위치 예시: infra/docker/fluent-bit.conf

[SERVICE]
    Flush        1
    Daemon       Off
    Log_Level    info
    Parsers_File /fluent-bit/config/parsers.conf

[INPUT]
    Name              forward
    Listen            0.0.0.0
    Port              24224
    Tag               docker.*

[FILTER]
    Name    parser
    Match   docker.*
    Key_Name log
    Parser  panopticon_json
    Reserve_Data On

[FILTER]
    Name    grep
    Match   docker.*
    Regex   type ^log$

[OUTPUT]
    Name        http
    Match       docker.*
    Host        api.jungle-panopticon.cloud
    Port        443
    URI         /producer/v1/logs
    Format      json
    json_date_format iso8601
    Header      Content-Type application/json
    tls         On
    tls.verify  On
    Retry_Limit 5`,
        language: 'bash',
      },

      // -----------------------------------
      // 4-2. docker-compose 설정 추가
      // -----------------------------------
      {
        heading: '4-2. docker-compose.yml 설정 추가',
        description: '작업 유형: 📄 새 파일 생성',
        code: `# 파일 위치 예시: docker/docker-compose.yml

services:
  fluent-bit:
    image: fluent/fluent-bit:2.2
    container_name: panopticon-fluent-bit
    restart: unless-stopped
    volumes:
      - ../infra/docker:/fluent-bit/config:ro
    command: ["-c", "/fluent-bit/config/fluent-bit.conf"]
    ports:
      - "24224:24224"
      - "24224:24224/udp"
    extra_hosts:
      - "host.docker.internal:host-gateway"

  app:
    # ... 기존 설정들
    depends_on:
      - postgres
      - fluent-bit
    logging:
      driver: fluentd
      options:
        fluentd-address: 127.0.0.1:24224
        tag: docker.panopticon-app
        fluentd-async: "true"
        fluentd-retry-wait: "1s"
        fluentd-max-retries: "30"
    environment:
      # ✅ Trace + Log에 공통으로 쓰일 환경 변수
      - OTEL_SERVICE_NAME=your-backend-service
      - NODE_ENV=production
      - OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://host.docker.internal:3005/producer/v1/traces
      - SERVICE_NAME=your-backend-service`,
        language: 'yaml',
      },

      // -----------------------------------
      // 4-3. Docker 재시작
      // -----------------------------------
      {
        heading: '4-3. Docker 서비스 재시작',
        description: '작업 유형: 🖥️ 터미널 명령어 실행 (코드 파일 수정 없음)',
        code: `docker compose down
docker compose up -d --build`,
        language: 'bash',
      },
    ],

    checklist: [
      '백엔드 서버를 재시작합니다.\n   - Docker: `docker compose restart app`',
      '백엔드 API를 1회 이상 호출합니다.',
      'Panopticon 대시보드에서 다음 두 가지를 모두 확인합니다.\n① Trace 생성 여부\n② Log 생성 여부',
    ],
  },
];

//
// 최종 Export – 공통 레이아웃 적용
//
export default function BackendLogTraceGuide() {
  return <InstallGuideLayout steps={steps} icon={<PiStackLight className="h-10 w-10" />} />;
}
