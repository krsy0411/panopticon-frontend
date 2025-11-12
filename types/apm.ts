/**
 * APM 페이지 API 타입 정의
 */

// 서비스 타입
export type ServiceType = 'API_GATEWAY' | 'API' | 'WORKER' | 'DB' | 'CACHE' | 'WEB';

// 1.1 활성 서비스 목록
export interface ApmService {
  service_name: string;
  service_type: ServiceType;
  request_count: number;
  error_rate: number;
  p95_latency_ms: number;
  issues_count: number;
}

export interface ServicesResponse {
  total_count: number;
  page: number;
  size: number;
  services: ApmService[];
}

// 1.2 이슈 목록
export interface Issue {
  issue_id: string;
  service_name: string;
  message: string;
  occurred_at: string;
  affected_requests: number;
}

export interface IssuesResponse {
  issues: Issue[];
}

// 1.3 서비스맵
export interface ServiceNode {
  service_name: string;
  service_type: string;
  request_count: number;
  error_rate: number;
  avg_latency_ms: number;
}

export interface ServiceEdge {
  source: string;
  target: string;
  request_count: number;
  avg_latency_ms: number;
  error_count: number;
}

export interface ServiceMapResponse {
  nodes: ServiceNode[];
  edges: ServiceEdge[];
}

// 2.1 서비스 메트릭
export interface LatencyDataPoint {
  timestamp: string;
  p90: number;
  p95: number;
  p99_9: number;
}

export interface RequestsErrorsDataPoint {
  timestamp: string;
  hits: number;
  errors: number;
}

export interface ErrorsByStatusDataPoint {
  timestamp: string;
  status_500: number;
  status_502: number;
  status_503: number;
  status_504: number;
}

export interface ServiceMetricsResponse {
  service_name: string;
  start_time: string;
  end_time: string;
  interval: string;
  data: {
    requests_and_errors: RequestsErrorsDataPoint[];
    errors_by_status: ErrorsByStatusDataPoint[];
    latency: LatencyDataPoint[];
  };
}

// 2.2 서비스 리소스
export interface Resource {
  resource_name: string;
  requests: number;
  total_time_ms: number;
  avg_time_ms: number;
  p95_latency_ms: number;
  errors: number;
  error_rate: number;
  updated_at: string;
}

export interface ResourceResponse {
  resources: Resource[];
  total: number;
  page: number;
  limit: number;
}

export interface ResourceTableRow {
  resourceName: string;
  requests: number;
  totalTime: string;
  p95Latency: number;
  errors: number;
  errorRate: string;
  date: string;
}

// 2.3 서비스 의존성
export interface DependencyRequest {
  service_name: string;
  total_requests: number;
  error_rate: number;
}

export interface ServiceDependenciesResponse {
  service_name: string;
  incoming_requests: DependencyRequest[];
  outgoing_requests: DependencyRequest[];
}

// 2.7 로그
export type LogLevel = 'ERROR' | 'WARNING' | 'INFO';

export type LogEntry = {
  id: string;
  level: LogLevel;
  service: string;
  traceId: string;
  message: string;
  timestamp: string;
};

export type StatItem = {
  id: string;
  label: string;
  value: number;
  tone?: 'neutral' | 'danger' | 'warning' | 'info';
};

export interface LogStatsBreakdown {
  level: string;
  count: number;
  percentage: number;
}

export interface ServiceLogStatsResponse {
  service_name: string;
  start_time: string;
  end_time: string;
  total_logs: number;
  error_count: number;
  warning_count: number;
  info_count: number;
  breakdown: LogStatsBreakdown[];
}

export interface ServiceLog {
  log_id: string;
  timestamp: string;
  level: string;
  service: string;
  message: string;
  trace_id?: string;
  span_id?: string;
  attributes?: Record<string, string>;
}

export interface ServiceLogsResponse {
  logs: ServiceLog[];
  total: number;
  page: number;
  limit: number;
  filtered_level?: string;
}

// 2.4 트레이스
export interface Trace {
  trace_id: string;
  date: string;
  resource: string;
  service: string;
  duration_ms: number;
  method: string;
  status_code: number;
  span_count: number;
  error: boolean;
}

export interface ServiceTracesResponse {
  traces: Trace[];
  total: number;
  page: number;
  limit: number;
}

// 2.6 에러 목록
export interface ErrorItem {
  error_id: string;
  service_name: string;
  error_message: string;
  resource: string;
  count: number;
  first_seen: string;
  last_seen: string;
  stack_trace: string;
  sample_trace_ids: string[];
}

export interface ServiceErrorsResponse {
  errors: ErrorItem[];
  total: number;
  page: number;
  limit: number;
}

// 에러 트렌드 데이터
export interface ErrorTrendPoint {
  timestamp: string;
  count: number;
}

export interface ErrorTrendSeries {
  service: string;
  color: string;
  data: ErrorTrendPoint[];
}
