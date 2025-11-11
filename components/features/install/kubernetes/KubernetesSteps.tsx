import { ReactNode } from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { CopyableCodeBlock } from '../CopyableCodeBlock';

type BaseStepProps = {
  icon: ReactNode;
  title: string;
  totalSteps: number;
};

export interface KubernetesStepOneProps extends BaseStepProps {
  onNext: () => void;
}

export function KubernetesStepOne({ icon, title, totalSteps, onNext }: KubernetesStepOneProps) {
  const otelSdkCode = `import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';


const OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

console.log('[OTEL] Initializing OpenTelemetry...');

const traceExporter = new OTLPTraceExporter({
  url: \`\${OTLP_ENDPOINT}/v1/traces\`,
  headers: {},
});

const metricExporter = new OTLPMetricExporter({
  url: \`\${OTLP_ENDPOINT}/v1/metrics\`,
  headers: {},
});

const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 10000, // Export every 10 seconds
});

const sdk = new NodeSDK({
  serviceName: 'ecommerce-backend',
  traceExporter,
  metricReader,
  instrumentations: [
    getNodeAutoInstrumentations({
      // Enable all auto-instrumentations
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        ignoreIncomingRequestHook: (req) => {
          // Ignore health check, background tasks, system checks
          const url = req.url || '';
          return url.includes('/health') ||
                 url.includes('/metrics') ||
                 req.headers['user-agent']?.includes('kube-probe');
        },
      },
      '@opentelemetry/instrumentation-express': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-nestjs-core': {
        enabled: true,
      },
      // Disable Node.js runtime metrics (eventloop, GC, heap, etc.)
      // These metrics send data periodically even without user activity
      '@opentelemetry/instrumentation-runtime-node': {
        enabled: false,  // Disabled: eventloop.utilization, gc.duration, v8js.memory.heap, etc.
      },
    }),
  ],
});

sdk.start();
console.log('[OTEL] OpenTelemetry initialized successfully');

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('[OTEL] OpenTelemetry shut down successfully'))
    .catch((error) => console.error('[OTEL] Error shutting down OpenTelemetry', error))
    .finally(() => process.exit(0));
});

export default sdk;`;

  return (
    <section className="rounded-xl bg-white p-8 shadow-sm">
      <header className="mb-8 flex items-center gap-4">
        {icon}
        <div>
          <h1 className="text-3xl font-bold text-black">{title}</h1>
          <p className="mt-2 text-gray-600">Step 1 of {totalSteps}: OpenTelemetry SDK 설정</p>
        </div>
      </header>

      <div className="mb-8 space-y-6">
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            애플리케이션에 OpenTelemetry SDK를 추가합니다.
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            Traces, Metrics, Log를 자동으로 수집하는 OpenTelemetry SDK를 초기화합니다.
          </p>
          <CopyableCodeBlock code={otelSdkCode} />
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start gap-3">
            <IoCheckmarkCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900">주요 기능</h4>
              <ul className="mt-2 space-y-1 text-sm text-blue-800">
                <li>• HTTP, Express, NestJS 자동 계측</li>
                <li>• OTLP 프로토콜로 Traces와 Metrics 전송</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

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

export interface KubernetesStepTwoProps extends BaseStepProps {
  onPrev: () => void;
  onNext: () => void;
}

export function KubernetesStepTwo({
  icon,
  title,
  totalSteps,
  onPrev,
  onNext,
}: KubernetesStepTwoProps) {
  const otelCollectorConfig = `kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: otel-collector-config
  namespace: observability
data:
  collector-config.yaml: |
    extensions:
      health_check: {}

    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318

    processors:
      memory_limiter:
        check_interval: 2s
        limit_mib: 512
        spike_limit_mib: 128
      batch:
        timeout: 5s
        send_batch_size: 512
      resource:
        attributes:
          - action: insert
            key: service.namespace
            value: \\\${NAMESPACE}

    exporters:
      otlphttp:
        # Panopticon 엔드포인트 설정
        endpoint: "https://your-panopticon-domain.com/otlp"
        # 예시:
        # 프로덕션: https://api.panopticon.io/otlp
        # 개발: http://ingest-server.observability.svc.cluster.local:4318
        compression: gzip
        timeout: 10s

    service:
      extensions: [health_check]
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter, resource, batch]
          exporters: [otlphttp]
        metrics:
          receivers: [otlp]
          processors: [memory_limiter, resource, batch]
          exporters: [otlphttp]
EOF`;

  const fluentBitConfig = `kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluent-bit-config
  namespace: tenant-a
  labels:
    app: fluent-bit
data:
  fluent-bit.conf: |
    [SERVICE]
        Flush        1
        Daemon       Off
        Log_Level    info
        Parsers_File parsers.conf

    [INPUT]
        Name              tail
        Path              /var/log/containers/*_tenant-a_*.log
        Exclude_Path      /var/log/containers/ingest-server*.log,/var/log/containers/otel-collector*.log,/var/log/containers/fluent-bit*.log
        multiline.parser  docker, cri
        Tag               kube.*
        Refresh_Interval  5
        Mem_Buf_Limit     5MB
        Skip_Long_Lines   On

    [FILTER]
        Name                parser
        Match               kube.*
        Key_Name            log
        Parser              json
        Reserve_Data        On
        Preserve_Key        Off

    [OUTPUT]
        Name  http
        Match *
        # ALB endpoint (production)
        Host  panopticon-alb-2099783513.ap-northeast-2.elb.amazonaws.com
        Port  80
        URI   /producer/logs
        Format json
        Json_date_key timestamp
        Json_date_format iso8601
        tls   Off

  parsers.conf: |
    [PARSER]
        Name   docker
        Format json
        Time_Key time
        Time_Format %Y-%m-%dT%H:%M:%S.%L%z
        Time_Keep On

    [PARSER]
        Name   cri
        Format regex
        Regex  ^(?<time>[^ ]+) (?<stream>stdout|stderr) (?<logtag>[^ ]*) (?<log>.*)$
        Time_Key    time
        Time_Format %Y-%m-%dT%H:%M:%S.%L%z

    [PARSER]
        Name   json
        Format json

  shape.lua: |
    local allowed_apps = {
      backend = true,
      frontend = true
    }

    function shape_record(tag, timestamp, record)
      -- Check if app is allowed
      local app = nil
      if record["kubernetes"] and record["kubernetes"]["labels"] then
        app = record["kubernetes"]["labels"]["app"]
      end

      if app == nil or allowed_apps[app] ~= true then
        return -1, 0, 0
      end

      -- If log is already structured JSON with required fields, pass it through
      if record["type"] == "log" and record["service_name"] and record["message"] then
        -- Already properly formatted, just clean up kubernetes metadata
        local payload = {
          type = record["type"],
          timestamp = record["timestamp"],
          service_name = record["service_name"],
          environment = record["environment"],
          level = record["level"],
          message = record["message"],
          trace_id = record["trace_id"],
          span_id = record["span_id"],
        }

        -- Add HTTP fields if present
        if record["http_method"] then
          payload["http_method"] = record["http_method"]
          payload["http_path"] = record["http_path"]
          payload["http_status_code"] = record["http_status_code"]
        end

        return 1, timestamp, payload
      end

      -- Otherwise, build payload from raw log
      local payload = {
        type = "log",
        timestamp = record["time"] or os.date("!%Y-%m-%dT%H:%M:%S.000Z"),
        service_name = app or "unknown",
        environment = "unknown",
        level = "INFO",
        message = record["log"] or tostring(record),
        trace_id = nil,
        span_id = nil,
      }

      return 1, timestamp, payload
    end
EOF`;

  const otelDaemonSetConfig = `apiVersion: v1
kind: ServiceAccount
metadata:
  name: otel-collector
  namespace: tenant-a
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: otel-collector
rules:
  - apiGroups: [""]
    resources: ["pods", "namespaces", "nodes", "nodes/stats"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["apps"]
    resources: ["replicasets"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["extensions"]
    resources: ["replicasets"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: otel-collector
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: otel-collector
subjects:
  - kind: ServiceAccount
    name: otel-collector
    namespace: tenant-a
---
apiVersion: v1
kind: Service
metadata:
  name: otel-collector
  namespace: tenant-a
  labels:
    app: otel-collector
spec:
  selector:
    app: otel-collector
  ports:
    - name: otlp-grpc
      port: 4317
      targetPort: 4317
      protocol: TCP
    - name: otlp-http
      port: 4318
      targetPort: 4318
      protocol: TCP
    - name: metrics
      port: 8888
      targetPort: 8888
      protocol: TCP
    - name: zpages
      port: 55679
      targetPort: 55679
      protocol: TCP
  type: ClusterIP
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: otel-collector
  namespace: tenant-a
  labels:
    app: otel-collector
spec:
  selector:
    matchLabels:
      app: otel-collector
  template:
    metadata:
      labels:
        app: otel-collector
    spec:
      serviceAccountName: otel-collector
      hostPID: true
      containers:
        - name: otel-collector
          image: otel/opentelemetry-collector-contrib:0.91.0
          imagePullPolicy: IfNotPresent
          args:
            - "--config=/conf/collector-config.yaml"
          ports:
            - name: otlp-grpc
              containerPort: 4317
              protocol: TCP
            - name: otlp-http
              containerPort: 4318
              protocol: TCP
            - name: metrics
              containerPort: 8888
              protocol: TCP
            - name: zpages
              containerPort: 55679
              protocol: TCP
          env:
            - name: MY_POD_IP
              valueFrom:
                fieldRef:
                  apiVersion: v1
                  fieldPath: status.podIP
            - name: K8S_NODE_NAME
              valueFrom:
                fieldRef:
                  fieldPath: spec.nodeName
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
          volumeMounts:
            - name: otel-collector-config
              mountPath: /conf
            - name: hostfs
              mountPath: /hostfs
              readOnly: true
          securityContext:
            privileged: true
      volumes:
        - name: otel-collector-config
          configMap:
            name: otel-collector-config
            items:
              - key: collector-config.yaml
                path: collector-config.yaml
        - name: hostfs
          hostPath:
            path: /
      tolerations:
        - operator: "Exists"
          effect: "NoSchedule"
        - operator: "Exists"
          effect: "NoExecute"
`;

  const fluentBitDaemonSetConfig = `apiVersion: v1
kind: ServiceAccount
metadata:
  name: fluent-bit
  namespace: tenant-a
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: fluent-bit-tenant-a
rules:
  - apiGroups: [""]
    resources:
      - namespaces
      - pods
      - pods/logs
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: fluent-bit-tenant-a
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: fluent-bit-tenant-a
subjects:
  - kind: ServiceAccount
    name: fluent-bit
    namespace: tenant-a
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluent-bit
  namespace: tenant-a
  labels:
    app: fluent-bit
    tenant: user-a
spec:
  selector:
    matchLabels:
      app: fluent-bit
  template:
    metadata:
      labels:
        app: fluent-bit
        tenant: user-a
    spec:
      serviceAccountName: fluent-bit
      containers:
      - name: fluent-bit
        image: fluent/fluent-bit:3.0
        imagePullPolicy: IfNotPresent
        volumeMounts:
        - name: varlog
          mountPath: /var/log
          readOnly: true
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
        - name: fluent-bit-config
          mountPath: /fluent-bit/etc/
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
      - name: fluent-bit-config
        configMap:
          name: fluent-bit-config
`;

  return (
    <section className="rounded-xl bg-white p-8 shadow-sm">
      <header className="mb-8 flex items-center gap-4">
        {icon}
        <div>
          <h1 className="text-3xl font-bold text-black">{title}</h1>
          <p className="mt-2 text-gray-600">Step 2 of {totalSteps}: ConfigMap으로 Collector 설정</p>
        </div>
      </header>

      <div className="mb-8 space-y-8">
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            OTel Collector와 Fluent Bit을 DaemonSet으로 배포하여 데이터를 수집하는 파이프라인을
            구성합니다.
          </h3>
          <p className="mb-6 text-sm text-gray-600">
            이 설정은 데이터를 수신하고, 배치 처리 후 Panopticon 엔드포인트로 전송합니다.
          </p>

          <div className="space-y-8">
            <div>
              <h4 className="mb-3 text-base font-semibold text-gray-800">
                1. OTel Collector Config 설정
              </h4>
              <CopyableCodeBlock code={otelCollectorConfig} className="max-h-96" />
            </div>

            <div>
              <h4 className="mb-3 text-base font-semibold text-gray-800">
                2. Fluent Bit Config 설정
              </h4>
              <CopyableCodeBlock code={fluentBitConfig} className="max-h-96" />
            </div>

            <div>
              <h4 className="mb-3 text-base font-semibold text-gray-800">
                3. OTel Collector DaemonSet 설정
              </h4>
              <CopyableCodeBlock code={otelDaemonSetConfig} className="max-h-96" />
            </div>

            <div>
              <h4 className="mb-3 text-base font-semibold text-gray-800">
                4. Fluent Bit DaemonSet 설정
              </h4>
              <CopyableCodeBlock code={fluentBitDaemonSetConfig} className="max-h-96" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
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
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          다음 단계
        </button>
      </div>
    </section>
  );
}

export interface KubernetesStepThreeProps extends BaseStepProps {
  onPrev: () => void;
  onNext: () => void;
}

export function KubernetesStepThree({
  icon,
  title,
  totalSteps,
  onPrev,
  onNext,
}: KubernetesStepThreeProps) {
  const daemonSetCommand = `const OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';`;

  return (
    <section className="rounded-xl bg-white p-8 shadow-sm">
      <header className="mb-8 flex items-center gap-4">
        {icon}
        <div>
          <h1 className="text-3xl font-bold text-black">{title}</h1>
          <p className="mt-2 text-gray-600">
            Step 3 of {totalSteps}: OTel Collector DaemonSet 배포
          </p>
        </div>
      </header>

      <div className="mb-8 space-y-6">
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            환경변수로 데이터 전송지를 설정합니다.
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            각 노드에서 실행되는 애플리케이션이 Collector로 데이터를 전송할 수 있도록 합니다.
          </p>
          <CopyableCodeBlock code={daemonSetCommand} className="max-h-96" />
        </div>
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
          다음 단계
        </button>
      </div>
    </section>
  );
}

export interface KubernetesStepFourProps extends BaseStepProps {
  onPrev: () => void;
  onInstallAnother: () => void;
  onGoDashboard: () => void;
}

export function KubernetesStepFour({
  icon,
  title,
  totalSteps,
  onPrev,
  onInstallAnother,
  onGoDashboard,
}: KubernetesStepFourProps) {
  const verificationCommands = `kubectl get daemonset -n observability
kubectl logs -n observability -l app=otel-collector`;

  return (
    <section className="rounded-xl bg-white p-8 shadow-sm">
      <header className="mb-8 flex items-center gap-4">
        {icon}
        <div>
          <h1 className="text-3xl font-bold text-black">{title}</h1>
          <p className="mt-2 text-gray-600">Step 4 of {totalSteps}: 배포 확인</p>
        </div>
      </header>

      <div className="mb-8 space-y-6">
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            DaemonSet이 정상적으로 배포되었는지 확인합니다.
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            아래 명령어를 실행하여 OTel Collector가 모든 노드에서 정상적으로 실행되고 있는지
            확인하세요.
          </p>
          <CopyableCodeBlock code={verificationCommands} />
        </div>

        <div className="md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h4 className="mb-3 font-semibold text-gray-900">필수 점검 항목</h4>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <IoCheckmarkCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <span>DaemonSet의 DESIRED, CURRENT, READY 숫자가 모두 일치하는지 확인</span>
              </li>
              <li className="flex items-start gap-2">
                <IoCheckmarkCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <span>로그에서 에러나 경고 메시지가 없는지 확인</span>
              </li>
              <li className="flex items-start gap-2">
                <IoCheckmarkCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <span>Panopticon 엔드포인트로 정상적으로 데이터를 전송하는지 확인</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <div className="mb-4 flex items-start gap-3">
            <IoCheckmarkCircle className="h-6 w-6 shrink-0 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">배포가 완료되었습니다!</p>
              <p className="mt-1 text-sm text-green-700">
                Panopticon Console에서 수집되는 데이터를 확인해보세요.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
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
      </div>

      <div className="flex justify-start">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:border-gray-400"
        >
          이전 단계
        </button>
      </div>
    </section>
  );
}
