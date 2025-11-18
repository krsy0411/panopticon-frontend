'use client';

import { PiFileTextLight } from 'react-icons/pi';

// 🟦 수정: 새 레이아웃 컴포넌트 import
import InstallGuideLayout from './common/InstallGuideLayout';

type StepSection = {
  heading?: string;
  description?: string;
  meta?: string;
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
    title: '패키지 설치 & StructuredLogger 추가',
    description:
      '백엔드 로그를 JSON 포맷으로 출력해서 Fluent Bit이 쉽게 파싱할 수 있도록\n전용 Logger 서비스를 추가하고 중요 필드를 채우기 위해 패키지를 설치합니다.',
    meta: '작업 유형: 📄 새 파일 생성 / 🖥️ 터미널 명령어 실행 (코드 파일 수정 없음)',
    sections: [
      {
        heading: '1-1. StructuredLogger 추가',
        description: '작업 유형: 📄 새 파일 생성',
        code: `// backend/src/logger/structured-logger.service.ts 파일을 새로 생성합니다.

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

 // (선택) 나중에 Trace SDK를 붙이면 자동으로 trace_id / span_id를 채우기 위한 자리입니다.
  private getTraceContext() {
    const span = trace.getActiveSpan();
    if (!span) return {};
    const ctx = span.spanContext();
    return {
      trace_id: ctx.traceId,
      span_id: ctx.spanId,
    };
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

  log(message: any, meta?: any) {
    this.format('info', message, meta);
  }

  error(message: any, trace?: string, meta?: any) {
    this.format('error', message, { trace, ...meta });
  }

  warn(message: any, meta?: any) {
    this.format('warn', message, meta);
  }

  debug(message: any, meta?: any) {
    this.format('debug', message, meta);
  }

  verbose(message: any, meta?: any) {
    this.format('verbose', message, meta);
  }

  // HTTP 요청 전용 헬퍼
  logHttp(params: {
    method: string;
    path: string;
    status: number;
    durationMs: number;
    ip?: string;
  }) {
    const level =
      params.status >= 500
        ? 'error'
        : params.status >= 400
        ? 'warn'
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

      {
        heading: '1-2. 필요한 패키지 설치',
        description: '작업 유형: 🖥️ 터미널 명령어 실행(코드 파일 수정 없음)',
        code: `# backend 디렉터리에서 실행하세요
npm install --save @opentelemetry/api@^1.9.0`,
        language: 'bash',
      },
    ],
  },

  // ----------------------------------------------------
  // STEP 2
  // ----------------------------------------------------
  {
    subtitle: 'Step 2 of 4',
    title: 'LoggerModule 전역 등록 & main.ts에서 기본 로거 교체',
    meta: '작업 유형: 📄 새 파일 생성 / ✏️ 기존 파일 수정',

    description:
      '전체 애플리케이션에서 동일한 구조화 로거를 사용하기 위해 LoggerModule을 전역 등록하고,\nmain.ts에서 Nest 기본 Logger 대신 StructuredLogger를 사용하도록 변경합니다.',
    sections: [
      {
        heading: '2-1. LoggerModule 추가',
        description: '작업 유형: 📄 새 파일 생성',
        code: `// backend/src/logger/logger.module.ts 파일을 새로 생성합니다.


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

      {
        heading: '2-2. AppModule에 LoggerModule 추가',
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

      {
        heading: '2-3. main.ts에서 StructuredLogger 사용',
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
  // STEP 3
  // ----------------------------------------------------
  {
    subtitle: 'Step 3 of 4',
    title: 'Fluent Bit 설정 파일 추가',
    meta: '작업 유형: 📄 새 파일 생성',

    description:
      'Docker 컨테이너에서 출력되는 JSON 로그를 수집하기 위해 Fluent Bit 메인 설정 파일과 JSON 파서 설정 파일을 추가합니다.',
    sections: [
      {
        heading: '3-1. fluent-bit.conf 생성',
        description: '작업 유형: 📄 새 파일 생성',
        code: `# infra/docker/fluent-bit.conf 파일을 새로 생성합니다.
# - Docker 컨테이너 로그를 입력(Input)으로 받고
# - type=log 인 레코드만 필터링해서
# - Panopticon Ingest API(/producer/v1/logs)로 HTTP 전송합니다.

[SERVICE]
    Flush        1
    Daemon       Off
    Log_Level    info
    Parsers_File /fluent-bit/config/parsers.conf

# Docker 컨테이너 로그 수신 (fluentd forward 프로토콜)
[INPUT]
    Name              forward
    Listen            0.0.0.0
    Port              24224
    Tag               docker.*

# StructuredLogger가 출력하는 JSON 로그를 파싱
[FILTER]
    Name    parser
    Match   docker.*
    Key_Name log
    Parser  panopticon_json
    Reserve_Data On

# type=log 인 레코드만 통과 (다른 타입은 제외)
[FILTER]
    Name    grep
    Match   docker.*
    Regex   type ^log$

# Panopticon Ingest API로 HTTP 전송
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
    Retry_Limit 5

`,
        language: 'bash',
      },

      {
        heading: '3-2. parsers.conf 생성',
        description: '작업 유형: 📄 새 파일 생성',
        code: `# infra/docker/parsers.conf 파일을 새로 생성합니다.
# - StructuredLogger가 출력한 timestamp 필드를 Fluent Bit 시간으로 사용합니다.

[PARSER]
    Name        panopticon_json
    Format      json
    Time_Key    timestamp
    Time_Format %Y-%m-%dT%H:%M:%S.%LZ
    Time_Keep   On

`,
        language: 'bash',
      },
    ],
  },

  // ----------------------------------------------------
  // STEP 4
  // ----------------------------------------------------
  {
    subtitle: 'Step 4 of 4',
    title: 'docker-compose에서 Fluent Bit와 로그 드라이버를 설정',
    description:
      '백엔드 컨테이너의 stdout 로그를 Fluent Bit로 전달하기 위해\napp 서비스에 fluentd 로그 드라이버를 설정하고 Fluent Bit 컨테이너 서비스를 추가합니다.',
    meta: '작업 유형: ✏️ 기존 파일 수정 / 📄 새 파일 생성(선택)',

    sections: [
      {
        heading: '4-1. docker-compose.yml 수정',
        description: '작업 유형: ✏️ 기존 파일 수정',
        code: `# docker/docker-compose.yml 일부 예시

services:
  backend:
    build:
      context: ../backend
    container_name: backend
    depends_on:
      - postgres
      - fluent-bit
    logging:
      driver: fluentd
      options:
        fluentd-address: 127.0.0.1:24224
        tag: docker.backend
        fluentd-async: "true"
        fluentd-retry-wait: "1s"
        fluentd-max-retries: "30"

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
`,
        language: 'yaml',
      },
      {
        heading: '4-2. docker/.env 새 서비스 정의 추가 (선택)',
        description: '작업 유형: 📄 새 파일 생성',
        code: `# [선택] docker/.env 에 서비스 이름과 환경을 지정해두면
# StructuredLogger에서 해당 값을 service_name / environment 로 사용합니다.

SERVICE_NAME=panopticon-app
NODE_ENV=production`,
        language: 'bash',
      },
    ],

    checklist: [
      '백엔드 서버를 재시작합니다.\n   - Docker: `docker compose restart backend`',
      '백엔드 API를 1회 이상 호출합니다.\n   - 프론트에서 버튼 클릭 또는\n   - curl/Postman으로 직접 호출 (예: `curl http://localhost:3000/products`)',
      'Panopticon 대시보드에서\n   **백엔드 서비스 이름**으로 새로운 로그가 생성되는지 확인합니다.',
    ],
  },
];

export default function BackendLogGuide() {
  return <InstallGuideLayout steps={steps} icon={<PiFileTextLight className="h-10 w-10" />} />;
}
