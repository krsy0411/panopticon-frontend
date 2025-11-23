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
        <div className="grid grid-cols-2 gap-4 text-sm">
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

// Node.js 환경별 설치 가이드
function getNodeJsGuides(baseEnv: string, formValues: AgentSetupFormValues): GuideStep[] {
  const npmInstall = `npm install --save \\
  @opentelemetry/api@^1.9.0 \\
  @opentelemetry/sdk-node@^0.208.0 \\
  @opentelemetry/auto-instrumentations-node@^0.67.0 \\
  @opentelemetry/exporter-trace-otlp-http@^0.208.0 \\
  @opentelemetry/resources@^2.2.0 \\
  @opentelemetry/semantic-conventions@^1.38.0`;

  const baseGuides: GuideStep[] = [
    {
      title: 'Step 1: NPM 패키지 설치',
      description: 'OpenTelemetry 필요 패키지를 설치합니다.',
      code: npmInstall,
      language: 'bash',
    },
    {
      title: 'Step 2: tracing.ts 파일 생성',
      description: '애플리케이션 시작 시 NodeSDK를 초기화합니다.',
      code: `// src/tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from '@opentelemetry/semantic-conventions';

const serviceName = process.env.OTEL_SERVICE_NAME || '${formValues.serviceName}';
const environment = process.env.NODE_ENV || '${formValues.serviceEnvironment}';
const tracesEndpoint =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
  'http://host.docker.internal:3005/producer/v1/traces';

const resource = new Resource({
  [SEMRESATTRS_SERVICE_NAME]: serviceName,
  [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: environment,
});

const traceExporter = new OTLPTraceExporter({ url: tracesEndpoint });

const sdk = new NodeSDK({
  resource,
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((log) => console.log('Error terminating tracing', log))
    .finally(() => process.exit(0));
});`,
      language: 'typescript',
    },
    {
      title: 'Step 3: 메인 파일에서 tracing import',
      description: '애플리케이션 진입점 최상단에서 tracing을 import합니다.',
      code: `// app.ts 또는 main.ts 최상단에
import './tracing';

// 나머지 코드...`,
      language: 'typescript',
    },
  ];

  // 환경별 추가 설정
  if (formValues.runtimeEnvironment === 'docker') {
    baseGuides.push({
      title: 'Step 4: Docker 환경변수 설정',
      description: 'Docker run 명령어에서 환경변수를 설정합니다.',
      code: `docker run \\
  -e ${baseEnv.split('\n').join(' \\\n  -e ')} \\
  -p 3000:3000 \\
  your-image:latest`,
      language: 'bash',
    });
  } else if (formValues.runtimeEnvironment === 'kubernetes') {
    baseGuides.push({
      title: 'Step 4: Kubernetes ConfigMap 설정',
      description: 'ConfigMap을 통해 환경변수를 설정합니다.',
      code: `apiVersion: v1
kind: ConfigMap
metadata:
  name: otel-config
data:
  OTEL_SERVICE_NAME: "${formValues.serviceName}"
  OTEL_EXPORTER_OTLP_ENDPOINT: "http://otel-collector:4318"
  OTEL_EXPORTER_OTLP_HEADERS: "Authorization=Bearer ${formValues.licenseKey}"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  template:
    spec:
      containers:
      - name: app
        envFrom:
        - configMapRef:
            name: otel-config`,
      language: 'yaml',
    });
  } else if (formValues.runtimeEnvironment === 'lambda') {
    baseGuides.push({
      title: 'Step 4: Lambda 환경변수 설정',
      description: 'AWS Lambda 콘솔 또는 SAM에서 환경변수를 설정합니다.',
      code: `# SAM template.yaml
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      Environment:
        Variables:
          OTEL_SERVICE_NAME: "${formValues.serviceName}"
          OTEL_EXPORTER_OTLP_ENDPOINT: "https://otel-collector.example.com"
          OTEL_EXPORTER_OTLP_HEADERS: "Authorization=Bearer ${formValues.licenseKey}"
      Layers:
        - arn:aws:lambda:region:account:layer:opentelemetry-nodejs`,
      language: 'yaml',
    });
  } else if (formValues.runtimeEnvironment === 'linux-host') {
    baseGuides.push({
      title: 'Step 4: 환경변수 설정 (.env 파일)',
      description: '애플리케이션 디렉터리에 .env 파일을 생성합니다.',
      code: `.env
${baseEnv}`,
      language: 'bash',
    });
  }

  return baseGuides;
}

// Python 환경별 설치 가이드
function getPythonGuides(baseEnv: string, formValues: AgentSetupFormValues): GuideStep[] {
  const baseGuides: GuideStep[] = [
    {
      title: 'Step 1: pip으로 패키지 설치',
      description: 'OpenTelemetry Python 패키지를 설치합니다.',
      code: `pip install opentelemetry-api \\
    opentelemetry-sdk \\
    opentelemetry-exporter-otlp \\
    opentelemetry-instrumentation`,
      language: 'bash',
    },
    {
      title: 'Step 2: Tracer 초기화',
      description: '애플리케이션 시작 시 Tracer를 초기화합니다.',
      code: `# main.py
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
import os

service_name = os.getenv('OTEL_SERVICE_NAME', '${formValues.serviceName}')
resource = Resource(attributes={
    SERVICE_NAME: service_name
})

trace_provider = TracerProvider(resource=resource)
otlp_exporter = OTLPSpanExporter(
    endpoint=os.getenv('OTEL_EXPORTER_OTLP_ENDPOINT', 'http://localhost:3005/v1/traces')
)
trace_provider.add_span_processor(BatchSpanProcessor(otlp_exporter))
trace.set_tracer_provider(trace_provider)`,
      language: 'python',
    },
  ];

  if (formValues.runtimeEnvironment === 'docker') {
    baseGuides.push({
      title: 'Step 3: Dockerfile에 환경변수 설정',
      description: 'Docker 컨테이너 실행 시 환경변수를 설정합니다.',
      code: `FROM python:3.11

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

ENV OTEL_SERVICE_NAME="${formValues.serviceName}"
ENV OTEL_EXPORTER_OTLP_ENDPOINT="http://otel-collector:4318"

COPY . .
CMD ["python", "main.py"]`,
      language: 'dockerfile',
    });
  } else if (formValues.runtimeEnvironment === 'kubernetes') {
    baseGuides.push({
      title: 'Step 3: Kubernetes 환경변수 설정',
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
        - name: OTEL_EXPORTER_OTLP_ENDPOINT
          value: "http://otel-collector:4318"`,
      language: 'yaml',
    });
  } else if (formValues.runtimeEnvironment === 'linux-host') {
    baseGuides.push({
      title: 'Step 3: 환경변수 설정',
      description: '.env 파일을 생성하고 애플리케이션을 실행합니다.',
      code: `# .env 파일 생성
${baseEnv.replace('OTEL_EXPORTER_OTLP_ENDPOINT', 'OTEL_EXPORTER_OTLP_TRACES_ENDPOINT')}

# 애플리케이션 실행
source .env
python main.py`,
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
