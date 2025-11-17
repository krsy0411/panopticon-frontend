/**
 * APM 페이지 API 타입 정의
 */

// ==================== 공통 타입 ====================

/**
 * 공통 쿼리 파라미터: 시간 범위
 */
export interface TimeRangeParams {
  from?: string; // ISO 8601 date-time
  to?: string; // ISO 8601 date-time
}

/**
 * 공통 쿼리 파라미터: 환경 필터
 */
export interface EnvironmentParams {
  environment?: string; // 예: prod, stage, dev
}

/**
 * 공통 쿼리 파라미터: 페이지네이션
 */
export interface PaginationParams {
  page?: number; // 1부터 시작
  size?: number;
}

/**
 * 공통 응답: 페이지네이션 메타데이터
 */
export interface PaginationMeta {
  total: number;
  page: number;
  size: number;
}

/**
 * 공통 레이블 (추가 메타데이터)
 */
export type Labels = Record<string, string> | null;

/**
 * 스팬 종류
 */
export type SpanKind = 'SERVER' | 'CLIENT' | 'INTERNAL';

/**
 * 스팬/트레이스 상태
 */
export type Status = 'OK' | 'ERROR';

/**
 * 로그 레벨
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

/**
 * 정렬 순서
 */
export type SortOrder = 'asc' | 'desc';

// ==================== 데이터 스키마 ====================

/**
 * 스팬 이벤트 (트레이스 내 개별 작업)
 */
export interface SpanItem {
  timestamp: string; // ISO 8601 date-time
  span_id: string;
  parent_span_id: string | null;
  name: string;
  kind: SpanKind;
  duration_ms: number;
  status: Status;
  service_name: string;
  environment: string;
  http_method?: string | null;
  http_path?: string | null;
  http_status_code?: number | null;
  labels?: Labels;
  db_statement?: string | null;
}

/**
 * 로그 이벤트
 */
export interface LogItem {
  timestamp: string; // ISO 8601 date-time
  level: LogLevel;
  message: string;
  service_name: string;
  span_id?: string | null;
  trace_id?: string | null;
  labels?: Labels;
}

/**
 * 서비스 집계 메트릭 (요약)
 */
export interface ServiceSummary {
  service_name: string;
  environment: string;
  request_count: number;
  latency_p95_ms: number;
  error_rate: number; // 0~1
  labels?: Labels;
}

/**
 * 엔드포인트 메트릭
 */
export interface EndpointMetrics {
  endpoint_name: string;
  service_name: string;
  environment: string;
  request_count: number;
  latency_p95_ms: number;
  error_rate: number; // 0~1
  labels?: Labels;
}

/**
 * 트레이스 요약
 */
export interface TraceSummary {
  trace_id: string;
  root_span_name: string;
  status: Status;
  duration_ms: number;
  start_time: string; // ISO 8601 date-time
  service_name: string;
  environment: string;
  labels?: Labels;
}

/**
 * 메트릭 데이터 포인트
 */
export interface MetricPoint {
  timestamp: string; // ISO 8601 date-time
  value: number;
  labels?: Labels;
}

/**
 * 메트릭 시계열 데이터
 */
export interface MetricTimeSeries {
  metric_name: string;
  service_name: string;
  environment: string;
  points: MetricPoint[];
}

// ==================== API 엔드포인트 타입 ====================

// ---------- GET /services ----------

/**
 * 서비스 메트릭 정렬 기준
 */
export type ServiceSortBy = 'request_count' | 'latency_p95_ms' | 'error_rate';

/**
 * GET /services - 쿼리 파라미터
 */
export interface GetServicesParams extends TimeRangeParams, EnvironmentParams {
  sort_by?: ServiceSortBy;
  limit?: number; // 기본값: 50, 최소: 1
  name_filter?: string; // 대소문자 구분 없음
}

/**
 * GET /services - 응답
 */
export interface GetServicesResponse extends TimeRangeParams {
  services: ServiceSummary[];
}

// ---------- GET /traces/{traceId} ----------

/**
 * GET /traces/{traceId} - 쿼리 파라미터
 */
export interface GetTraceByIdParams extends EnvironmentParams {
  service?: string; // 서비스 이름 필터
}

/**
 * GET /traces/{traceId} - 응답
 */
export interface GetTraceByIdResponse {
  trace_id: string;
  spans: SpanItem[];
  logs: LogItem[];
}

// ---------- GET /services/{serviceName}/metrics ----------

/**
 * 메트릭 종류
 */
export type MetricType =
  | 'http_requests_total'
  | 'latency_p95_ms'
  | 'error_rate'
  | 'latency_p90_ms'
  | 'latency_p50_ms';

/**
 * GET /services/{serviceName}/metrics - 쿼리 파라미터
 */
export interface GetServiceMetricsParams extends TimeRangeParams, EnvironmentParams {
  metric?: MetricType; // 생략 시 모든 메트릭 반환
  interval?: string; // 예: 1m, 5m, 1h (시간 단위: s, m, h)
}

/**
 * GET /services/{serviceName}/metrics - 응답
 * 단일 메트릭 또는 배열 형태로 반환
 */
export type GetServiceMetricsResponse = MetricTimeSeries | MetricTimeSeries[];

// ---------- GET /logs ----------

/**
 * GET /logs - 쿼리 파라미터
 */
export interface GetLogsParams extends TimeRangeParams, EnvironmentParams, PaginationParams {
  service_name?: string;
  level?: LogLevel;
  trace_id?: string;
  span_id?: string;
  message?: string; // 메시지 전문 검색
  sort?: SortOrder; // 기본값: desc
}

/**
 * GET /logs - 응답
 */
export interface GetLogsResponse extends PaginationMeta {
  items: LogItem[];
  /**
   * TODO: 백엔드 API 준비 시 추가 예정
   * 레벨별 전체 로그 카운트 (페이지네이션과 무관한 전체 통계)
   *
   * 현재는 items 배열로 계산하지만, 페이지네이션된 데이터로는 정확한 통계를 알 수 없음.
   * 백엔드에서 직접 집계한 전체 카운트를 받아야 정확한 통계 표시 가능.
   *
   * 예시 구조:
   * level_counts: {
   *   ERROR: 150,
   *   WARN: 800,
   *   INFO: 9050,
   *   DEBUG: 2000
   * }
   */
  level_counts?: Record<LogLevel, number>;
}

/**
 * UI용 로그 엔트리 (LogItem을 기반으로 변환된 형태)
 */
export interface LogEntry {
  id: string;
  level: LogLevel;
  service: string;
  traceId: string;
  message: string;
  timestamp: string;
}

// ---------- GET /spans ----------

/**
 * 스팬 정렬 순서
 */
export type SpanSortOrder = 'duration_asc' | 'duration_desc' | 'start_time_asc' | 'start_time_desc';

/**
 * GET /spans - 쿼리 파라미터
 */
export interface GetSpansParams extends TimeRangeParams, EnvironmentParams, PaginationParams {
  service_name?: string;
  name?: string; // 스팬 이름 (정확히 일치)
  kind?: SpanKind;
  status?: Status;
  min_duration_ms?: number;
  max_duration_ms?: number;
  trace_id?: string;
  parent_span_id?: string;
  sort?: SpanSortOrder; // 기본값: start_time_desc
}

/**
 * GET /spans - 응답
 */
export interface GetSpansResponse extends PaginationMeta {
  items: SpanItem[];
}

// ---------- GET /services/{serviceName}/endpoints ----------

/**
 * 엔드포인트 메트릭 정렬 기준
 */
export type EndpointSortBy = 'request_count' | 'latency_p95_ms' | 'error_rate';

/**
 * GET /services/{serviceName}/endpoints - 쿼리 파라미터
 */
export interface GetServiceEndpointsParams extends TimeRangeParams, EnvironmentParams {
  metric?: MetricType; // 생략 시 모든 메트릭 계산 및 request_count로 정렬
  sort_by?: EndpointSortBy; // 기본값: request_count
  limit?: number; // 기본값: 10, 최소: 1
  name_filter?: string; // 대소문자 구분 없음
}

/**
 * GET /services/{serviceName}/endpoints - 응답
 */
export interface GetServiceEndpointsResponse extends TimeRangeParams {
  service_name: string;
  environment: string;
  endpoints: EndpointMetrics[];
}

// ---------- GET /services/{serviceName}/traces ----------

/**
 * 트레이스 정렬 순서
 */
export type TraceSortOrder =
  | 'duration_desc'
  | 'duration_asc'
  | 'start_time_desc'
  | 'start_time_asc';

/**
 * GET /services/{serviceName}/traces - 쿼리 파라미터
 */
export interface GetServiceTracesParams
  extends TimeRangeParams,
    EnvironmentParams,
    PaginationParams {
  status?: Status;
  min_duration_ms?: number;
  max_duration_ms?: number;
  sort?: TraceSortOrder; // 기본값: duration_desc
}

/**
 * GET /services/{serviceName}/traces - 응답
 */
export interface GetServiceTracesResponse extends PaginationMeta {
  traces: TraceSummary[];
}

// ---------- GET /services/{serviceName}/errors ----------

/**
 * 에러 아이템 (서비스 에러 분포)
 */
export interface ErrorItem {
  error_message: string; // 에러 메시지
  service_name: string;
  resource: string; // 리소스 (엔드포인트 또는 작업)
  count: number; // 발생 횟수
  last_seen: string; // ISO 8601 date-time
  labels?: Labels;
}

/**
 * 에러 트렌드 데이터 포인트
 */
export interface ErrorTrendPoint {
  timestamp: string; // ISO 8601 date-time
  count: number; // 해당 시간대 에러 발생 횟수
}

/**
 * 에러 트렌드 시리즈 (서비스별)
 */
export interface ErrorTrendSeries {
  service: string; // 서비스 이름
  color: string; // 차트 색상
  data: ErrorTrendPoint[];
}

/**
 * GET /services/{serviceName}/errors - 쿼리 파라미터
 */
export interface GetServiceErrorsParams extends TimeRangeParams, EnvironmentParams {
  resource_filter?: string; // 리소스 필터 (대소문자 구분 없음)
  message_filter?: string; // 에러 메시지 필터 (대소문자 구분 없음)
  limit?: number; // 기본값: 100, 최소: 1
}

/**
 * GET /services/{serviceName}/errors - 응답
 */
export interface GetServiceErrorsResponse extends TimeRangeParams {
  service_name: string;
  environment: string;
  errors: ErrorItem[];
}
