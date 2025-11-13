import { PlatformData, PlatformType } from '@/types/agent-install';
import { SiKubernetes, SiDocker, SiApple, SiAmazonecs, SiOpentelemetry } from 'react-icons/si';
import { SiFluentbit } from 'react-icons/si';

export const platformsData: Record<PlatformType, PlatformData> = {
  kubernetes: {
    icon: <SiKubernetes className="w-12 h-12 text-blue-600" />,
    iconLarge: <SiKubernetes className="w-8 h-8 text-blue-600" />,
    title: 'Kubernetes에서 OpenTelemetry Collector 배포',
    description:
      'K8s 클러스터에서 OTel Collector를 DaemonSet으로 배포하여 애플리케이션 데이터를 수집',
    steps: [
      {
        title: '1. Namespace 생성',
        description: 'OpenTelemetry Collector를 배포할 전용 namespace를 생성합니다.',
        code: `kubectl create namespace observability`,
        language: 'bash',
      },
      {
        title: '2. ConfigMap으로 Collector 설정',
        description: 'OTel Collector의 수집, 처리, 전송 파이프라인을 ConfigMap으로 정의합니다.',
        code: `kubectl apply -f - <<EOF
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
EOF`,
        language: 'bash',
      },
      {
        title: '3. OTel Collector DaemonSet 배포',
        description:
          'DaemonSet으로 각 노드마다 Collector를 배포합니다. hostPort를 사용하여 localhost 접근을 허용합니다.',
        code: `kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: otel-collector
  namespace: observability
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
      containers:
      - name: otel-collector
        image: otel/opentelemetry-collector-contrib:0.90.0
        ports:
        - containerPort: 4317  # OTLP gRPC
          protocol: TCP
          name: otlp-grpc
          hostPort: 4317
        - containerPort: 4318  # OTLP HTTP
          protocol: TCP
          name: otlp-http
          hostPort: 4318
        env:
        - name: NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        volumeMounts:
        - name: config
          mountPath: /etc/otel-collector
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
      volumes:
      - name: config
        configMap:
          name: otel-collector-config
          items:
          - key: collector-config.yaml
            path: config.yaml
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: otel-collector
  namespace: observability
EOF`,
        language: 'bash',
      },
      {
        title: '4. 배포 확인',
        description: 'DaemonSet이 정상적으로 배포되었는지 확인하고 로그를 확인합니다.',
        code: `kubectl get daemonset -n observability
kubectl logs -n observability -l app=otel-collector`,
        language: 'bash',
      },
    ],
    category: 'Container Platform',
  },
  docker: {
    icon: <SiDocker className="w-12 h-12 text-blue-500" />,
    iconLarge: <SiDocker className="w-8 h-8 text-blue-500" />,
    title: 'Install the Panopticon Agent on Docker',
    description: 'Docker 컨테이너 내에서 에이전트를 실행해 서비스 데이터를 수집',
    steps: [
      {
        title: 'Docker 컨테이너로 Panopticon Agent 실행',
        description:
          'Docker 명령어로 Panopticon Agent 컨테이너를 실행합니다. 호스트 시스템의 Docker 소켓과 시스템 정보에 접근하여 데이터를 수집합니다.',
        code: `docker run -d --name panopticon-agent \\
  -e PANOPTICON_API_KEY=<YOUR_API_KEY> \\
  -e PANOPTICON_SITE="panopticon.com" \\
  -v /var/run/docker.sock:/var/run/docker.sock:ro \\
  -v /proc/:/host/proc/:ro \\
  -v /sys/fs/cgroup/:/host/sys/fs/cgroup:ro \\
  panopticon/agent:latest`,
        language: 'bash',
      },
    ],
    category: 'Container Platform',
  },
  ecs: {
    icon: <SiAmazonecs className="w-12 h-12 text-orange-500" />,
    iconLarge: <SiAmazonecs className="w-8 h-8 text-orange-500" />,
    title: 'Install the Panopticon Agent on Amazon ECS',
    description: 'ECS 태스크에 에이전트를 포함해 서비스 데이터를 수집',
    steps: [
      {
        title: 'ECS Task Definition 생성',
        description:
          'Panopticon Agent를 포함한 ECS 태스크 정의를 생성합니다. API 키와 사이트 정보를 환경변수로 설정합니다.',
        code: `{
  "family": "panopticon-agent",
  "containerDefinitions": [
    {
      "name": "panopticon-agent",
      "image": "panopticon/agent:latest",
      "environment": [
        {
          "name": "PANOPTICON_API_KEY",
          "value": "<YOUR_API_KEY>"
        },
        {
          "name": "PANOPTICON_SITE",
          "value": "panopticon.com"
        }
      ]
    }
  ]
}`,
        language: 'json',
      },
    ],
    category: 'Container Platform',
  },
  macos: {
    icon: <SiApple className="w-12 h-12 text-gray-800" />,
    iconLarge: <SiApple className="w-8 h-8 text-gray-800" />,
    title: 'Install the Panopticon Agent on macOS',
    description: 'macOS 환경에 로컬 에이전트를 설치해 서비스 데이터를 수집',
    steps: [
      {
        title: '1. Panopticon Agent 다운로드 및 설치',
        description: '설치 스크립트를 다운로드하고 실행하여 Agent를 설치합니다.',
        code: `curl -L https://panopticon.com/agent/macos/install.sh | sh`,
        language: 'bash',
      },
      {
        title: '2. Agent 설정',
        description: 'API 키와 사이트 정보를 설정합니다.',
        code: `sudo panopticon-agent config set api_key <YOUR_API_KEY>
sudo panopticon-agent config set site panopticon.com`,
        language: 'bash',
      },
      {
        title: '3. Agent 시작',
        description: 'Panopticon Agent를 시작합니다.',
        code: `sudo panopticon-agent start`,
        language: 'bash',
      },
    ],
    category: 'Host based',
  },
  opentelemetry: {
    icon: <SiOpentelemetry className="w-12 h-12 text-purple-600" />,
    iconLarge: <SiOpentelemetry className="w-8 h-8 text-purple-600" />,
    title: 'Install the Panopticon Agent with OpenTelemetry',
    description: 'OpenTelemetry SDK 또는 Collector로 서비스 데이터를 수집',
    steps: [
      {
        title: '1. OpenTelemetry Collector 설치',
        description: '설치 스크립트를 다운로드하고 실행하여 OTel Collector를 설치합니다.',
        code: `curl -L https://panopticon.com/agent/otel/install.sh | sh`,
        language: 'bash',
      },
      {
        title: '2. Collector 설정 파일 생성',
        description: 'Traces와 Metrics를 수집하고 Panopticon으로 전송하는 설정 파일을 생성합니다.',
        code: `cat > otel-config.yaml <<EOF
receivers:
  otlp:
    protocols:
      grpc:
      http:

exporters:
  otlphttp:
    endpoint: "https://your-panopticon-domain.com/otlp"
    # 환경별 예시:
    # 프로덕션: https://api.panopticon.io/otlp
    # 개발/로컬: http://localhost:4318
    # Kubernetes: http://ingest-server.default.svc.cluster.local:4318
    headers:
      Authorization: "Bearer <YOUR_API_KEY>"

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlphttp]
    metrics:
      receivers: [otlp]
      exporters: [otlphttp]
EOF`,
        language: 'bash',
      },
      {
        title: '3. Collector 시작',
        description: '설정 파일을 사용하여 OTel Collector를 시작합니다.',
        code: `otelcol --config otel-config.yaml`,
        language: 'bash',
      },
    ],
    category: 'Monitoring',
  },
  fluentbit: {
    icon: <SiFluentbit className="w-12 h-12 text-cyan-600" />,
    iconLarge: <SiFluentbit className="w-8 h-8 text-cyan-600" />,
    title: 'Install Fluent Bit for Log Collection',
    description: 'Kubernetes 또는 Docker 환경에서 컨테이너 로그를 수집하고 전송',
    steps: [
      {
        title: 'Fluent Bit Kubernetes 배포',
        description:
          'Namespace, RBAC, ConfigMap, DaemonSet을 포함한 전체 Fluent Bit 로그 수집 시스템을 배포합니다.',
        code: `kubectl apply -f - <<EOF
---
apiVersion: v1
kind: Namespace
metadata:
  name: logging
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: fluent-bit
  namespace: logging
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: fluent-bit-read
rules:
- apiGroups: [""]
  resources:
  - namespaces
  - pods
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: fluent-bit-read
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: fluent-bit-read
subjects:
- kind: ServiceAccount
  name: fluent-bit
  namespace: logging
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluent-bit-config
  namespace: logging
data:
  fluent-bit.conf: |
    [SERVICE]
        Flush 1
        Log_Level info
        Parsers_File parsers.conf

    [INPUT]
        Name tail
        Path /var/log/containers/*.log
        multiline.parser docker, cri
        Tag kube.*

    [FILTER]
        Name kubernetes
        Match kube.*
        Merge_Log On

    [OUTPUT]
        Name http
        Match kube.*
        # Panopticon 엔드포인트 (환경에 따라 변경)
        Host your-panopticon-domain.com
        # 예시:
        # 프로덕션: api.panopticon.io
        # 개발: localhost
        # Kubernetes: ingest-server.default.svc.cluster.local
        Port 4318
        URI /fluent-bit/logs
        Format json
        tls Off
        # 프로덕션에서는 tls On 권장

  parsers.conf: |
    [PARSER]
        Name docker
        Format json
        Time_Key time
        Time_Format %Y-%m-%dT%H:%M:%S.%LZ
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluent-bit
  namespace: logging
spec:
  selector:
    matchLabels:
      app: fluent-bit
  template:
    metadata:
      labels:
        app: fluent-bit
    spec:
      serviceAccountName: fluent-bit
      containers:
      - name: fluent-bit
        image: fluent/fluent-bit:2.2
        volumeMounts:
        - name: varlog
          mountPath: /var/log
          readOnly: true
        - name: fluent-bit-config
          mountPath: /fluent-bit/etc/
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: fluent-bit-config
        configMap:
          name: fluent-bit-config
EOF`,
        language: 'bash',
      },
    ],
    category: 'Log Collection',
  },
};
