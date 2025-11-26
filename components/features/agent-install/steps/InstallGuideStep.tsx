'use client';

import { useState } from 'react';
import { HiCheckCircle, HiDocumentDuplicate } from 'react-icons/hi2';
import type { Agent, AgentSetupFormValues } from '@/types/agent-install';
import CodeBlock from '../CodeBlock';

interface InstallGuideStepProps {
  agent: Agent;
  formValues: AgentSetupFormValues;
  onNext: (values?: Partial<AgentSetupFormValues>) => void;
  onPrev?: () => void;
}

interface GuideStep {
  title: string;
  description: string;
  code: string;
  language?: string;
}

export default function InstallGuideStep({
  agent,
  formValues,
  onNext,
  onPrev,
}: InstallGuideStepProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});

  const selectedFramework = agent.frameworks.find((f) => f.id === formValues.framework);

  // 런타임 환경별 설치 가이드 생성
  const getInstallGuide = (): GuideStep[] => {
    const baseEnv = `OTEL_SERVICE_NAME=${formValues.serviceName}
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:3005
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Bearer%20${formValues.licenseKey}`;

    // Node.js 가이드
    if (agent.id === 'nodejs') {
      return getNodeJsGuides(baseEnv, formValues);
    }

    // Python 가이드
    if (agent.id === 'python') {
      return getPythonGuides(baseEnv, formValues);
    }

    // Java 가이드
    if (agent.id === 'java') {
      return getJavaGuides(baseEnv, formValues);
    }

    // Go 가이드
    if (agent.id === 'go') {
      return getGoGuides();
    }

    return [];
  };

  const guides = getInstallGuide();

  // SDK 자동 수집 항목
  const getAutomaticCollectionItems = (): string[] => {
    if (agent.id === 'nodejs') {
      return [
        '모든 HTTP 요청/응답 (Root Span)',
        '애플리케이션 로그 (Winston)',
        'DB 쿼리 (TypeORM)',
        '외부 API 호출 (axios)',
      ];
    }
    if (agent.id === 'python') {
      return [
        '모든 HTTP 요청/응답 (Root Span)',
        '애플리케이션 로그 (Python logging)',
        '외부 API 호출 (httpx, requests)',
        'Bedrock API 호출 (boto3)',
      ];
    }
    return [];
  };

  const handleCopy = (index: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">설치 가이드</h3>
        <p className="text-gray-600">
          {selectedFramework?.label} ({agent.label}) -{' '}
          {getRuntimeEnvironmentLabel(formValues.runtimeEnvironment)}
        </p>
      </div>

      {/* 환경 정보 요약 */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h4 className="font-medium text-gray-900 mb-3">현재 설정</h4>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-gray-600">프레임워크</span>
            <p className="font-medium text-gray-900">{selectedFramework?.label}</p>
          </div>
          <div>
            <span className="text-gray-600">런타임 환경</span>
            <p className="font-medium text-gray-900">
              {getRuntimeEnvironmentLabel(formValues.runtimeEnvironment)}
            </p>
          </div>
          <div>
            <span className="text-gray-600">계측 방법</span>
            <p className="font-medium text-gray-900 capitalize">
              {getInstrumentationLabel(formValues.instrumentationMethod)}
            </p>
          </div>
          <div>
            <span className="text-gray-600">수집 데이터</span>
            <p className="font-medium text-gray-900">{formValues.telemetryTypes.join(', ')}</p>
          </div>
        </div>

        {/* 자동 수집 항목 */}
        <div className="border-t border-gray-200 pt-4">
          <h5 className="font-medium text-gray-900 mb-2 text-sm">자동 수집되는 항목</h5>
          <ul className="space-y-1.5 mb-3">
            {getAutomaticCollectionItems().map((item, idx) => (
              <li key={idx} className="text-xs text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-600 italic">
            👉 SDK 초기화 시 설정을 통해 수집하고 싶은 항목을 커스터마이징할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 설치 단계들 */}
      <div className="space-y-6">
        {guides.map((guide, index) => (
          <div key={index} className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900">{guide.title}</h4>
              <p className="text-xs text-gray-600 mt-1">{guide.description}</p>
            </div>
            <div className="relative">
              <CodeBlock code={guide.code} language={guide.language} />
              <button
                onClick={() => handleCopy(index, guide.code)}
                className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors"
              >
                {copiedIndex === index ? (
                  <>
                    <HiCheckCircle className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <HiDocumentDuplicate className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 체크리스트 */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <h4 className="font-medium text-green-900 mb-3">✓ 완료 체크리스트</h4>
        <ul className="space-y-2 text-sm text-green-800">
          <li className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checkedItems[0] || false}
              onChange={(e) => setCheckedItems({ ...checkedItems, 0: e.target.checked })}
              className="h-4 w-4 cursor-pointer"
            />
            <span>위 단계별로 SDK를 설치했습니다</span>
          </li>
          <li className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checkedItems[1] || false}
              onChange={(e) => setCheckedItems({ ...checkedItems, 1: e.target.checked })}
              className="h-4 w-4 cursor-pointer"
            />
            <span>환경변수를 설정했습니다</span>
          </li>
          <li className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checkedItems[2] || false}
              onChange={(e) => setCheckedItems({ ...checkedItems, 2: e.target.checked })}
              className="h-4 w-4 cursor-pointer"
            />
            <span>애플리케이션을 재시작했습니다</span>
          </li>
        </ul>
      </div>

      {/* 버튼 영역 */}
      <div className="flex gap-3">
        {onPrev && (
          <button
            onClick={onPrev}
            className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            이전 단계로
          </button>
        )}
        <button
          onClick={() => onNext()}
          className="flex-1 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          다음 단계로 (Validation)
        </button>
      </div>
    </div>
  );
}

// ============ 헬퍼 함수들 ============

function getRuntimeEnvironmentLabel(env: string): string {
  const labels: Record<string, string> = {
    docker: 'Docker',
    kubernetes: 'Kubernetes',
    ecs: 'AWS ECS',
    lambda: 'AWS Lambda',
    'linux-host': 'Linux Host',
    windows: 'Windows',
  };
  return labels[env] || env;
}

function getInstrumentationLabel(method: string): string {
  const labels: Record<string, string> = {
    auto: 'Auto Instrumentation',
    manual: 'Manual Instrumentation',
    container: 'Container-based',
  };
  return labels[method] || method;
}

// Node.js 환경별 설치 가이드 (@woongno/nestjs-monitoring-sdk)
function getNodeJsGuides(baseEnv: string, formValues: AgentSetupFormValues): GuideStep[] {
  const npmInstall = `npm install @woongno/nestjs-monitoring-sdk`;

  const baseGuides: GuideStep[] = [
    {
      title: 'Step 1: NPM 패키지 설치',
      description: 'Woongno 모니터링 SDK를 설치합니다.',
      code: npmInstall,
      language: 'bash',
    },
    {
      title: 'Step 2: SDK 초기화 (main.ts)',
      description: '애플리케이션의 main.ts 파일에서 MonitoringSDK를 초기화합니다. 수집하고 싶은 항목에 대해서만 true로 설정하세요.',
      code: `// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MonitoringSDK } from '@woongno/nestjs-monitoring-sdk';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // SDK 초기화
  MonitoringSDK.init(app, {
    apiKey: '${formValues.licenseKey}',
    endpoint: 'https://producer.woongno-monitoring.com',
    serviceName: '${formValues.serviceName}',
    environment: '${formValues.serviceEnvironment}',
    // 선택 설정 - 필요한 항목만 true로 설정
    batchSize: 100,
    flushInterval: 5000,
    enableLogTracking: true,           // 로그 수집
    enableHttpTracking: true,          // HTTP 요청/응답 추적
    enableDbTracking: true,            // DB 쿼리 추적
    enableHttpClientTracking: true,    // 외부 API 호출 추적
  });

  await app.listen(3000);
}
bootstrap();`,
      language: 'typescript',
    },
    {
      title: 'Step 3: TypeORM DB 추적 설정 (선택사항)',
      description: 'TypeORM 설정에서 DB 쿼리 추적을 활성화합니다.',
      code: `// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringSDK } from '@woongno/nestjs-monitoring-sdk';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      // DB 쿼리 추적 활성화
      logging: true,
      logger: MonitoringSDK.getDbLogger(),
    }),
  ],
})
export class AppModule {}`,
      language: 'typescript',
    },
    {
      title: 'Step 4: Trace Context 접근 (선택사항)',
      description: '비즈니스 로직에서 현재 Trace ID/Span ID를 접근합니다.',
      code: `import { getCurrentTraceId, getCurrentSpanId } from '@woongno/nestjs-monitoring-sdk';

export class UserService {
  async getUser(id: string) {
    const traceId = getCurrentTraceId();
    const spanId = getCurrentSpanId();

    console.log(\`[TraceID: \${traceId}] Fetching user \${id}\`);

    // 비즈니스 로직...
  }
}`,
      language: 'typescript',
    },
  ];

  // 환경별 추가 설정
  if (formValues.runtimeEnvironment === 'docker') {
    baseGuides.push({
      title: 'Step 5: Docker 환경변수 설정',
      description: 'Docker run 명령어에서 환경변수를 설정합니다.',
      code: `docker run \\
  -e OTEL_SERVICE_NAME="${formValues.serviceName}" \\
  -e NODE_ENV="${formValues.serviceEnvironment}" \\
  -p 3000:3000 \\
  your-image:latest`,
      language: 'bash',
    });
  } else if (formValues.runtimeEnvironment === 'kubernetes') {
    baseGuides.push({
      title: 'Step 5: Kubernetes ConfigMap 설정',
      description: 'ConfigMap을 통해 환경변수를 설정합니다.',
      code: `apiVersion: v1
kind: ConfigMap
metadata:
  name: monitoring-config
data:
  NODE_ENV: "${formValues.serviceEnvironment}"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nestjs-app
spec:
  template:
    spec:
      containers:
      - name: app
        image: my-nestjs-app:latest
        env:
        - name: OTEL_SERVICE_NAME
          value: "${formValues.serviceName}"
        - name: NODE_ENV
          value: "${formValues.serviceEnvironment}"`,
      language: 'yaml',
    });
  } else if (formValues.runtimeEnvironment === 'linux-host') {
    baseGuides.push({
      title: 'Step 5: 환경변수 설정 (.env 파일)',
      description: '애플리케이션 디렉터리에 .env 파일을 생성합니다.',
      code: `# .env
NODE_ENV=${formValues.serviceEnvironment}`,
      language: 'bash',
    });
  }

  return baseGuides;
}

// Python 환경별 설치 가이드 (panopticon-monitoring)
function getPythonGuides(_baseEnv: string, formValues: AgentSetupFormValues): GuideStep[] {
  const baseGuides: GuideStep[] = [
    {
      title: 'Step 1: pip으로 패키지 설치',
      description: 'Panopticon 모니터링 SDK를 설치합니다.',
      code: `pip install panopticon-monitoring`,
      language: 'bash',
    },
    {
      title: 'Step 2: SDK 초기화 (main.py)',
      description: 'FastAPI 애플리케이션에서 MonitoringSDK를 초기화합니다. 수집하고 싶은 항목에 대해서만 True로 설정하세요.',
      code: `# main.py
from fastapi import FastAPI
from panopticon_monitoring import MonitoringSDK

app = FastAPI()

# SDK 초기화
sdk = MonitoringSDK.init(app, {
    'api_key': '${formValues.licenseKey}',
    'endpoint': 'https://producer.woongno-monitoring.com',
    'service_name': '${formValues.serviceName}',
    'environment': '${formValues.serviceEnvironment}',
    # 선택 설정 - 필요한 항목만 True로 설정
    'batch_size': 100,
    'flush_interval': 5,               # 초 단위
    'enable_log_tracking': True,       # 로그 수집
    'enable_http_tracking': True,      # HTTP 요청/응답 추적
    'enable_http_client_tracking': True,  # 외부 API 호출 추적
    'enable_bedrock_tracking': True,   # Bedrock API 추적
})

@app.get("/")
async def root():
    return {"message": "Hello World"}`,
      language: 'python',
    },
    {
      title: 'Step 3: 외부 API 호출 및 Bedrock 통합',
      description: '외부 API와 Bedrock 호출이 자동으로 추적됩니다.',
      code: `import json
import logging
import httpx
import boto3
from panopticon_monitoring import get_current_trace_id, get_current_span_id

logger = logging.getLogger(__name__)

bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')

@app.post("/chat/completions")
async def chat_completions(request: dict):
    trace_id = get_current_trace_id()
    logger.info(f"Processing chat completion request [TraceID: {trace_id}]")

    # 외부 API 호출 (자동 추적됨)
    async with httpx.AsyncClient() as client:
        user_response = await client.post(
            "https://api.nestjs-service.com/users/validate",
            json={"user_id": request.get("user_id")}
        )

    # Bedrock 호출 (자동 추적됨)
    bedrock_response = bedrock.invoke_model(
        modelId="anthropic.claude-3-sonnet-20240229-v1:0",
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "messages": [{"role": "user", "content": request.get("message")}]
        })
    )

    logger.info("Chat completion successful")
    return {"response": "..."}`,
      language: 'python',
    },
    {
      title: 'Step 4: 데이터 Flush (선택사항)',
      description: '테스트나 특수한 경우 즉시 데이터를 전송합니다.',
      code: `# 즉시 전송
await sdk.flush()

# 현재 버퍼 크기 확인
buffer_size = sdk.get_buffer_size()
print(f'Buffer size: {buffer_size}')`,
      language: 'python',
    },
  ];

  if (formValues.runtimeEnvironment === 'docker') {
    baseGuides.push({
      title: 'Step 5: Dockerfile 설정',
      description: 'Docker 컨테이너에서 필요한 의존성을 설치합니다.',
      code: `FROM python:3.11

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

ENV OTEL_SERVICE_NAME="${formValues.serviceName}"
ENV NODE_ENV="${formValues.serviceEnvironment}"

COPY . .
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
      language: 'dockerfile',
    });
  } else if (formValues.runtimeEnvironment === 'kubernetes') {
    baseGuides.push({
      title: 'Step 5: Kubernetes 환경변수 설정',
      description: 'Deployment에서 환경변수를 설정합니다.',
      code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: python-app
spec:
  template:
    spec:
      containers:
      - name: app
        image: my-python-app:latest
        env:
        - name: OTEL_SERVICE_NAME
          value: "${formValues.serviceName}"
        - name: NODE_ENV
          value: "${formValues.serviceEnvironment}"
        ports:
        - containerPort: 8000`,
      language: 'yaml',
    });
  } else if (formValues.runtimeEnvironment === 'linux-host') {
    baseGuides.push({
      title: 'Step 5: 환경변수 설정',
      description: '.env 파일을 생성하고 애플리케이션을 실행합니다.',
      code: `# .env 파일 생성
export OTEL_SERVICE_NAME="${formValues.serviceName}"
export NODE_ENV="${formValues.serviceEnvironment}"

# 애플리케이션 실행
source .env
python -m uvicorn main:app --reload`,
      language: 'bash',
    });
  }

  return baseGuides;
}

// Java 환경별 설치 가이드
function getJavaGuides(_baseEnv: string, formValues: AgentSetupFormValues): GuideStep[] {
  const baseGuides: GuideStep[] = [
    {
      title: 'Step 1: Maven 의존성 추가',
      description: 'pom.xml에 OpenTelemetry 의존성을 추가합니다.',
      code: `<dependencies>
  <dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-api</artifactId>
    <version>1.39.0</version>
  </dependency>
  <dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-sdk</artifactId>
    <version>1.39.0</version>
  </dependency>
  <dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-exporter-otlp</artifactId>
    <version>1.39.0</version>
  </dependency>
</dependencies>`,
      language: 'xml',
    },
  ];

  if (formValues.runtimeEnvironment === 'kubernetes') {
    baseGuides.push({
      title: 'Step 2: Kubernetes 배포 설정',
      description: 'Deployment에 OpenTelemetry SDK를 주입합니다.',
      code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: java-app
spec:
  template:
    spec:
      containers:
      - name: app
        image: my-java-app:latest
        env:
        - name: OTEL_SERVICE_NAME
          value: "${formValues.serviceName}"
        - name: OTEL_JAVAAGENT_ENABLED
          value: "true"`,
      language: 'yaml',
    });
  }

  return baseGuides;
}

// Go 환경별 설치 가이드
function getGoGuides(): GuideStep[] {
  return [
    {
      title: 'Step 1: Go 모듈 추가',
      description: 'OpenTelemetry Go 라이브러리를 추가합니다.',
      code: `go get go.opentelemetry.io/otel
go get go.opentelemetry.io/otel/sdk
go get go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`,
      language: 'bash',
    },
    {
      title: 'Step 2: Tracer 초기화',
      description: 'main 함수에서 Tracer를 초기화합니다.',
      code: `package main

import (
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/trace"
)

func init() {
	exporter, _ := otlptracehttp.New(context.Background())
	provider := trace.NewTracerProvider(trace.WithBatcher(exporter))
	otel.SetTracerProvider(provider)
}`,
      language: 'go',
    },
  ];
}
