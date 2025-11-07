import { ReactNode, useMemo } from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { FiClock, FiCopy, FiCheck } from 'react-icons/fi';
import { CopyableCodeBlock } from './CopyableCodeBlock';
import { MonitoringOptions } from './types';

type BaseStepProps = {
  icon: ReactNode;
  title: string;
  totalSteps: number;
};

type OnToggleOption = (option: keyof MonitoringOptions) => void;

export interface DockerStepOneProps extends BaseStepProps {
  monitoringOptions: MonitoringOptions;
  onToggleOption: OnToggleOption;
  onNext: () => void;
}

export function DockerStepOne({
  icon,
  title,
  totalSteps,
  monitoringOptions,
  onToggleOption,
  onNext,
}: DockerStepOneProps) {
  return (
    <section className="rounded-xl bg-white p-8 shadow-sm">
      <header className="mb-8 flex items-center gap-4">
        {icon}
        <div>
          <h1 className="text-3xl font-bold text-black">{title}</h1>
          <p className="mt-2 text-gray-600">Step 1 of {totalSteps}: 수집할 데이터 선택</p>
        </div>
      </header>

      <div className="mb-8 space-y-3">
        {['traces', 'metrics', 'logs'].map((option) => (
          <TelemetryToggle
            key={option}
            label={option}
            checked={monitoringOptions[option as keyof MonitoringOptions]}
            onChange={() => onToggleOption(option as keyof MonitoringOptions)}
          />
        ))}
      </div>

      {monitoringOptions.logs ? (
        <Callout tone="warning">
          Logs는 Fluent Bit을 통해 컨테이너 로그 파일을 직접 수집합니다. Step 2에서 Fluent Bit 설치
          가이드를 확인하세요.
        </Callout>
      ) : (
        <Callout tone="info">
          ‼️ 로그를 수집하지 않으면 Trace 데이터의 상세 정보와 정확도가 떨어질 수 있습니다.
          <br />
          Trace와 로그를 함께 수집하면 요청 흐름을 더욱 정확하게 분석할 수 있습니다.
        </Callout>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          다음 단계
        </button>
      </div>
    </section>
  );
}

interface DockerStepTwoProps extends BaseStepProps {
  kafkaBroker: string;
  apiKey: string;
  onApiKeyChange: (value: string) => void;
  monitoringOptions: MonitoringOptions;
  onPrev: () => void;
  onNext: () => void;
}

export function DockerStepTwo({
  icon,
  title,
  totalSteps,
  kafkaBroker,
  apiKey,
  onApiKeyChange,
  monitoringOptions,
  onPrev,
  onNext,
}: DockerStepTwoProps) {
  const otelConfig = useMemo(
    () => generateOtelConfig({ apiKey, kafkaBroker, monitoringOptions }),
    [apiKey, kafkaBroker, monitoringOptions],
  );

  const fluentBitConfig = useMemo(
    () => generateFluentBitConfig(apiKey || '<YOUR_API_KEY>'),
    [apiKey],
  );

  const dockerRunCommand = `docker run -d --name panopticon-collector \\
  --network panopticon-network \\
  -p 4317:4317 \\
  -p 4318:4318 \\
  -v \${PWD}/otel-config.yaml:/etc/otelcol/config.yaml:ro \\
  otel/opentelemetry-collector-contrib:latest \\
  --config /etc/otelcol/config.yaml`;

  const dockerNetworkCommand = 'docker network create panopticon-network';

  const envExample = `PANOPTICON_API_KEY=pa_xxxxxxxxxx
PANOPTICON_ENDPOINT=https://api.panopticon.io
PANOPTICON_CLUSTER_NAME=$(hostname)
PANOPTICON_LOG_LEVEL=info`;

  const handleDownload = (filename: string, contents: string) => {
    const blob = new Blob([contents], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-xl bg-white p-8 shadow-sm">
      <header className="mb-8 flex items-center gap-4">
        {icon}
        <div>
          <h1 className="text-3xl font-bold text-black">{title}</h1>
          <p className="mt-2 text-gray-600">Step 2 of {totalSteps}: Collector 및 Network 설정</p>
        </div>
      </header>

      <div className="space-y-6">
        <div>
          <Label>1. Docker Network 생성</Label>
          <p className="mb-3 text-sm text-gray-600">
            애플리케이션 컨테이너와 Collector가 통신할 수 있도록 같은 네트워크에 연결해야 합니다.
          </p>
          <CopyableCodeBlock code={dockerNetworkCommand} />
        </div>

        <div>
          <Label>2. API Key *</Label>
          <input
            value={apiKey}
            onChange={(event) => onApiKeyChange(event.target.value)}
            placeholder="Panopticon API 키를 입력하세요"
            className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 text-black outline-none transition focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            API 키는 Panopticon 대시보드에서 발급받을 수 있습니다
          </p>
        </div>

        <Callout tone="info">
          <strong>데이터 전송 엔드포인트:</strong>{' '}
          <code className="rounded bg-blue-100 px-1.5 py-0.5 text-xs">{kafkaBroker}</code> 로 자동
          전송됩니다.
        </Callout>

        <div>
          <Label>3. 환경 변수 구성</Label>
          <CopyableCodeBlock code={envExample} />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <Label>4. OpenTelemetry Collector 설정 파일</Label>
            <button
              type="button"
              onClick={() => handleDownload('otel-config.yaml', otelConfig)}
              disabled={!apiKey}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              otel-config.yaml 다운로드
            </button>
          </div>
          <CopyableCodeBlock code={otelConfig} className="max-h-80" />
          <p className="mt-2 text-xs text-gray-500">
            이 설정은{' '}
            {[monitoringOptions.traces && 'Traces', monitoringOptions.metrics && 'Metrics']
              .filter(Boolean)
              .join(', ')}{' '}
            데이터를 수집하여 Panopticon Kafka 브로커로 전송합니다.
          </p>
        </div>

        {monitoringOptions.logs && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Label>5. Fluent Bit 설정 (Logs)</Label>
              <button
                type="button"
                onClick={() => handleDownload('fluent-bit.conf', fluentBitConfig)}
                disabled={!apiKey}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                fluent-bit.conf 다운로드
              </button>
            </div>
            <CopyableCodeBlock code={fluentBitConfig} className="max-h-80" />
          </div>
        )}

        <div>
          <Label>OTel Collector 컨테이너 실행</Label>
          <CopyableCodeBlock code={dockerRunCommand} />
          <p className="mt-2 text-xs text-gray-500">
            명령어를 실행하기 전에 otel-config.yaml 파일이 현재 디렉토리에 있는지 확인하세요.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:border-gray-400"
        >
          이전
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!apiKey}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          다음 단계
        </button>
      </div>
    </section>
  );
}

interface DockerStepThreeProps extends BaseStepProps {
  monitoringOptions: MonitoringOptions;
  kafkaBroker: string;
  connectionStatus: 'testing' | 'connected' | 'failed' | null;
  onTestConnection: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function DockerStepThree({
  icon,
  title,
  totalSteps,
  monitoringOptions,
  kafkaBroker,
  connectionStatus,
  onTestConnection,
  onPrev,
  onNext,
}: DockerStepThreeProps) {
  const appNetworkCommand = 'docker network connect panopticon-network <app-container>';
  const sdkEnvVars = `OTEL_EXPORTER_OTLP_ENDPOINT=http://panopticon-agent:4317
OTEL_EXPORTER_OTLP_INSECURE=true
OTEL_RESOURCE_ATTRIBUTES=service.name=my-service`;

  return (
    <section className="rounded-xl bg-white p-8 shadow-sm">
      <header className="mb-8 flex items-center gap-4">
        {icon}
        <div>
          <h1 className="text-3xl font-bold text-black">{title}</h1>
          <p className="mt-2 text-gray-600">Step 3 of {totalSteps}: 애플리케이션 연결</p>
        </div>
      </header>

      <div className="mb-8 space-y-6">
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-black">애플리케이션 컨테이너 연결</h2>
          <p className="text-sm text-gray-600">
            Collector와 동일한 네트워크(
            <code className="rounded bg-gray-200 px-1 text-[11px]">panopticon-network</code>)에
            애플리케이션 컨테이너를 연결해야 OTLP 데이터를 전송할 수 있습니다.
          </p>
          <CopyableCodeBlock code={appNetworkCommand} />
          <p className="text-xs text-gray-500">
            &lt;app-container&gt;는 실제 컨테이너 이름으로 바꿔주세요.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h3 className="font-semibold text-black">OTLP SDK / Exporter 설정</h3>
          <p className="mt-2 text-sm text-gray-600">
            Collector 컨테이너로 데이터를 내보내도록 환경 변수를 설정합니다.
          </p>
          <CopyableCodeBlock code={sdkEnvVars} className="mt-4" />
        </div>

        <div className="rounded-lg border border-gray-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-black">Agent 연결 상태</h3>
              <p className="text-sm text-gray-600">
                에이전트가 정상적으로 데이터를 전송하고 있는지 확인합니다
              </p>
            </div>
            <button
              type="button"
              onClick={onTestConnection}
              disabled={connectionStatus === 'testing'}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {connectionStatus === 'testing' ? '테스트 중...' : '연결 테스트'}
            </button>
          </div>
          <ConnectionStatus status={connectionStatus} />
        </div>

        <SummaryCard monitoringOptions={monitoringOptions} kafkaBroker={kafkaBroker} />

        <Callout tone="info">
          <strong>다음 단계:</strong> 애플리케이션에서 OTLP SDK를 설정하여{' '}
          <code className="rounded bg-blue-100 px-1.5 py-0.5">localhost:4317</code> 또는{' '}
          <code className="rounded bg-blue-100 px-1.5 py-0.5">localhost:4318</code>로 데이터를
          전송하도록 구성하세요.
        </Callout>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:border-gray-400"
        >
          이전 단계
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          설치 확인 단계로 이동
        </button>
      </div>
    </section>
  );
}

interface DockerVerificationStepProps extends BaseStepProps {
  verificationAcknowledged: boolean;
  verificationComplete: boolean;
  isInstalling: boolean;
  onVerificationChange: (value: boolean) => void;
  onPrev: () => void;
  onComplete: () => void;
  onInstallAnother: () => void;
  onGoDashboard: () => void;
}

export function DockerVerificationStep({
  icon,
  title,
  totalSteps,
  verificationAcknowledged,
  verificationComplete,
  isInstalling,
  onVerificationChange,
  onPrev,
  onComplete,
  onInstallAnother,
  onGoDashboard,
}: DockerVerificationStepProps) {
  const verificationCommands = `docker ps --filter "name=panopticon-agent" --format "table {{.Names}}\\t{{.Status}}"
curl -s http://localhost:9100/health`;

  return (
    <section className="rounded-xl bg-white p-8 shadow-sm">
      <header className="mb-8 flex items-center gap-4">
        {icon}
        <div>
          <h1 className="text-3xl font-bold text-black">{title}</h1>
          <p className="mt-2 text-gray-600">Step 4 of {totalSteps}: 설치 확인</p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h3 className="font-semibold text-black">필수 점검 항목</h3>
          <ul className="mt-3 space-y-3 text-sm text-gray-700">
            <li>컨테이너 상태가 Up / healthy인지 확인</li>
            <li>
              헬스 체크 응답에서{' '}
              <code className="rounded bg-gray-200 px-1 text-[11px]">status: &quot;ok&quot;</code>{' '}
              값을 확인
            </li>
            <li>Panopticon Console의 Agents 목록에서 노드 상태가 Connected인지 확인</li>
          </ul>
        </div>
        <div>
          <Label>헬스 체크 명령</Label>
          <CopyableCodeBlock code={verificationCommands} />
        </div>
      </div>

      <div className="mt-8 space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <label className="flex items-start gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={verificationAcknowledged}
            onChange={(event) => onVerificationChange(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>
            위 명령을 실행해 상태를 확인했고 Panopticon Console에서 에이전트가 Connected 상태임을
            확인했습니다.
          </span>
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onPrev}
            className="rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:border-gray-400"
          >
            이전 단계
          </button>
          <button
            type="button"
            onClick={onComplete}
            disabled={!verificationAcknowledged || isInstalling}
            className={`rounded-lg px-6 py-3 font-semibold text-white transition ${
              verificationAcknowledged
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'cursor-not-allowed bg-gray-400'
            }`}
          >
            {isInstalling ? '확인 중...' : verificationComplete ? '설치 완료됨' : '설치 완료'}
          </button>
        </div>
      </div>

      {verificationComplete && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-start gap-3">
            <IoCheckmarkCircle className="h-6 w-6 flex-shrink-0 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">에이전트 설치가 확인되었습니다</p>
              <p className="text-sm text-green-700">
                Panopticon Console에서 신규 노드를 모니터링해보세요.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onInstallAnother}
              className="rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:border-gray-400"
            >
              다른 에이전트 설치
            </button>
            <button
              type="button"
              onClick={onGoDashboard}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              대시보드로 이동
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function TelemetryToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  const labels: Record<string, { title: string; description: string }> = {
    traces: {
      title: 'Traces (분산 트레이싱)',
      description: '서비스 간 요청 흐름을 추적하여 병목 구간과 장애 원인을 빠르게 파악합니다.',
    },
    metrics: {
      title: 'Metrics (메트릭)',
      description: '시스템 및 애플리케이션 성능 지표를 실시간으로 모니터링합니다.',
    },
    logs: {
      title: 'Logs (로그)',
      description: '애플리케이션과 시스템 로그를 수집해 상세 이벤트를 분석합니다.',
    },
  };

  return (
    <div className="flex items-start justify-between rounded-lg border-2 border-blue-300 bg-white p-4 transition">
      <div className="flex-1">
        <h3 className="font-semibold text-black">{labels[label].title}</h3>
        <p className="text-sm text-gray-600">{labels[label].description}</p>
      </div>
      <label className="ml-4 inline-flex cursor-pointer items-center">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:mt-[2px] after:ml-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
      </label>
    </div>
  );
}

function Callout({ children, tone }: { children: ReactNode; tone: 'info' | 'warning' }) {
  const styles =
    tone === 'info'
      ? 'bg-blue-50 border-blue-200 text-blue-800'
      : 'bg-amber-50 border-amber-200 text-amber-800';
  return (
    <div className={`mb-6 rounded-lg border p-6 text-sm ${styles}`}>
      <p>{children}</p>
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-sm font-semibold text-gray-700">{children}</p>;
}

function ConnectionStatus({ status }: { status: 'testing' | 'connected' | 'failed' | null }) {
  if (!status) return null;

  if (status === 'testing') {
    return (
      <div className="flex items-center gap-3 rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <span className="font-medium text-gray-700">연결 상태 확인 중...</span>
      </div>
    );
  }

  if (status === 'connected') {
    return (
      <div className="flex items-center gap-3 rounded-lg border-2 border-green-300 bg-green-50 p-4">
        <IoCheckmarkCircle className="h-6 w-6 flex-shrink-0 text-green-600" />
        <div>
          <p className="font-semibold text-green-800">연결 성공</p>
          <p className="text-sm text-green-700">에이전트가 정상적으로 데이터를 전송하고 있습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 text-sm text-red-700">
      <p className="font-semibold text-red-800">연결 실패</p>
      <ul className="mt-2 list-disc space-y-1 pl-4">
        <li>Docker 컨테이너가 정상적으로 실행 중인지 확인</li>
        <li>API Key가 올바르게 입력되었는지 확인</li>
        <li>Kafka 브로커가 정상적으로 연결되었는지 확인</li>
        <li>방화벽에서 4317, 4318 포트가 열려있는지 확인</li>
      </ul>
    </div>
  );
}

function SummaryCard({
  monitoringOptions,
  kafkaBroker,
}: {
  monitoringOptions: MonitoringOptions;
  kafkaBroker: string;
}) {
  const selected = [
    monitoringOptions.traces && 'Traces',
    monitoringOptions.metrics && 'Metrics',
    monitoringOptions.logs && 'Logs',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="rounded-lg bg-gray-50 p-6 text-sm text-gray-700">
      <h3 className="mb-3 font-semibold text-black">설정 요약</h3>
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <IoCheckmarkCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
          <div>
            <span className="font-semibold">수집 데이터:</span>
            <span className="ml-2">{selected}</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <IoCheckmarkCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
          <div>
            <span className="font-semibold">Kafka 브로커:</span>
            <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 font-mono text-xs">
              {kafkaBroker}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <IoCheckmarkCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
          <div>
            <span className="font-semibold">OTLP 엔드포인트:</span>
            <span className="ml-2">gRPC (4317) &amp; HTTP (4318)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateOtelConfig({
  apiKey,
  kafkaBroker,
  monitoringOptions,
}: {
  apiKey: string;
  kafkaBroker: string;
  monitoringOptions: MonitoringOptions;
}) {
  const pipelines: string[] = [];

  if (monitoringOptions.traces) {
    pipelines.push(`    traces:
      receivers: [otlp]
      processors: [resource, batch]
      exporters: [kafka/traces]`);
  }

  if (monitoringOptions.metrics) {
    pipelines.push(`    metrics:
      receivers: [otlp]
      processors: [resource, batch]
      exporters: [kafka/metrics]`);
  }

  return `receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 10s
    send_batch_size: 1024
  resource:
    attributes:
      - key: panopticon.api_key
        value: "${apiKey || '<YOUR_API_KEY>'}"
        action: upsert
      - key: deployment.environment
        value: "production"
        action: upsert

exporters:${
    monitoringOptions.traces
      ? `
  kafka/traces:
    brokers: ["${kafkaBroker}"]
    topic: traces
    encoding: otlp_proto
    producer:
      compression: lz4
      max_message_bytes: 1000000`
      : ''
  }${
    monitoringOptions.metrics
      ? `
  kafka/metrics:
    brokers: ["${kafkaBroker}"]
    topic: metrics
    encoding: otlp_proto
    producer:
      compression: lz4
      max_message_bytes: 1000000`
      : ''
  }

service:
  pipelines:
${pipelines.join('\n')}
`;
}

function generateFluentBitConfig(apiKey: string) {
  return `[SERVICE]
    Flush        5
    Daemon       Off
    Log_Level    info

[INPUT]
    Name              tail
    Path              /var/lib/docker/containers/*/*.log
    Parser            docker
    Tag               docker.*
    Refresh_Interval  5

[FILTER]
    Name                modify
    Match               *
    Add                 panopticon.api_key ${apiKey}
    Add                 deployment.environment production

[OUTPUT]
    Name        kafka
    Match       *
    Brokers     kafka.panopticon.io:9092
    Topics      logs
    Timestamp_Key @timestamp
    Retry_Limit 3`;
}
