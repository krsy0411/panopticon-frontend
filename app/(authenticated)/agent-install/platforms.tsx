import { PlatformData, PlatformType } from '@/types/agent-install';
import { SiKubernetes, SiDocker, SiApple, SiAmazonecs, SiOpentelemetry } from 'react-icons/si';

export const platformsData: Record<PlatformType, PlatformData> = {
  kubernetes: {
    icon: <SiKubernetes className="w-12 h-12 text-blue-600" />,
    iconLarge: <SiKubernetes className="w-8 h-8 text-blue-600" />,
    title: 'Install the Panopticon Agent on Kubernetes',
    description: 'K8s 클러스터에서 에이전트를 DaemonSet으로 배포해 서비스 데이터를 수집',
    command: `kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: panopticon-agent-config
data:
  PANOPTICON_API_KEY: "<YOUR_API_KEY>"
  PANOPTICON_SITE: "panopticon.com"
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: panopticon-agent
spec:
  selector:
    matchLabels:
      app: panopticon-agent
  template:
    metadata:
      labels:
        app: panopticon-agent
    spec:
      containers:
      - name: agent
        image: panopticon/agent:latest
        envFrom:
        - configMapRef:
            name: panopticon-agent-config
EOF`,
    category: 'Container Platform',
  },
  docker: {
    icon: <SiDocker className="w-12 h-12 text-blue-500" />,
    iconLarge: <SiDocker className="w-8 h-8 text-blue-500" />,
    title: 'Install the Panopticon Agent on Docker',
    description: 'Docker 컨테이너 내에서 에이전트를 실행해 서비스 데이터를 수집',
    command: `docker run -d --name panopticon-agent \\
  -e PANOPTICON_API_KEY=<YOUR_API_KEY> \\
  -e PANOPTICON_SITE="panopticon.com" \\
  -v /var/run/docker.sock:/var/run/docker.sock:ro \\
  -v /proc/:/host/proc/:ro \\
  -v /sys/fs/cgroup/:/host/sys/fs/cgroup:ro \\
  panopticon/agent:latest`,
    category: 'Container Platform',
  },
  ecs: {
    icon: <SiAmazonecs className="w-12 h-12 text-orange-500" />,
    iconLarge: <SiAmazonecs className="w-8 h-8 text-orange-500" />,
    title: 'Install the Panopticon Agent on Amazon ECS',
    description: 'ECS 태스크에 에이전트를 포함해 서비스 데이터를 수집',
    command: `{
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
    category: 'Container Platform',
  },
  macos: {
    icon: <SiApple className="w-12 h-12 text-gray-800" />,
    iconLarge: <SiApple className="w-8 h-8 text-gray-800" />,
    title: 'Install the Panopticon Agent on macOS',
    description: 'macOS 환경에 로컬 에이전트를 설치해 서비스 데이터를 수집',
    command: `# Download and install the Panopticon Agent
curl -L https://panopticon.com/agent/macos/install.sh | sh

# Configure the agent
sudo panopticon-agent config set api_key <YOUR_API_KEY>
sudo panopticon-agent config set site panopticon.com

# Start the agent
sudo panopticon-agent start`,
    category: 'Host based',
  },
  opentelemetry: {
    icon: <SiOpentelemetry className="w-12 h-12 text-purple-600" />,
    iconLarge: <SiOpentelemetry className="w-8 h-8 text-purple-600" />,
    title: 'Install the Panopticon Agent with OpenTelemetry',
    description: 'OpenTelemetry SDK 또는 Collector로 서비스 데이터를 수집',
    command: `# Install OpenTelemetry Collector
curl -L https://panopticon.com/agent/otel/install.sh | sh

# Configure the collector
cat > otel-config.yaml <<EOF
receivers:
  otlp:
    protocols:
      grpc:
      http:

exporters:
  panopticon:
    endpoint: "https://panopticon.com"
    api_key: "<YOUR_API_KEY>"

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [panopticon]
EOF

# Start the collector
otelcol --config otel-config.yaml`,
    category: 'Monitoring',
  },
};
