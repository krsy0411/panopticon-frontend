/**
 * APM API 호출 함수들
 * React Query의 queryFn에서 사용됩니다.
 */

import {
  GetServicesParams,
  GetServicesResponse,
  GetTraceByIdParams,
  GetTraceByIdResponse,
  GetServiceMetricsParams,
  GetServiceMetricsResponse,
  GetLogsParams,
  GetLogsResponse,
  GetSpansParams,
  GetSpansResponse,
  GetServiceEndpointsParams,
  GetServiceEndpointsResponse,
  GetServiceTracesParams,
  GetServiceTracesResponse,
  GetServiceErrorsParams,
  GetServiceErrorsResponse,
} from '@/types/apm';

/**
 * API Base URL 가져오기
 * 환경변수에 설정된 API 서버 주소 사용
 */
const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || '';
};

/**
 * 공통 Fetch 헬퍼
 */
async function fetchJson<T>(url: string): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const fullUrl = `${baseUrl}${url}`;

  const response = await fetch(fullUrl);

  if (!response.ok) {
    const error = new Error(`HTTP error! status: ${response.status}`) as Error & {
      status?: number;
    };
    error.status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * 쿼리 파라미터를 URLSearchParams로 변환하는 헬퍼 함수
 */
function buildSearchParams(params?: object): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (!params) return searchParams;

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  return searchParams;
}

/**
 * URLSearchParams를 쿼리 스트링으로 변환
 */
function toQueryString(searchParams: URLSearchParams): string {
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// ==================== API 함수들 ====================

/**
 * GET /services
 * 서비스 별 개요(요약 메트릭) 조회
 */
export const getServices = async (params?: GetServicesParams): Promise<GetServicesResponse> => {
  const searchParams = buildSearchParams(params);
  const url = `/services${toQueryString(searchParams)}`;
  return fetchJson<GetServicesResponse>(url);
};

/**
 * GET /traces/{traceId}
 * traceId로 트레이스 및 관련 스팬/로그 조회
 */
export const getTraceById = async (
  traceId: string,
  params?: GetTraceByIdParams,
): Promise<GetTraceByIdResponse> => {
  const searchParams = buildSearchParams(params);
  const url = `/traces/${traceId}${toQueryString(searchParams)}`;
  return fetchJson<GetTraceByIdResponse>(url);
};

/**
 * GET /services/{serviceName}/metrics
 * 서비스 수준 집계 메트릭 조회
 */
export const getServiceMetrics = async (
  serviceName: string,
  params?: GetServiceMetricsParams,
): Promise<GetServiceMetricsResponse> => {
  const searchParams = buildSearchParams(params);
  const url = `/services/${serviceName}/metrics${toQueryString(searchParams)}`;
  return fetchJson<GetServiceMetricsResponse>(url);
};

/**
 * GET /logs
 * 로그 검색
 */
export const getLogs = async (params?: GetLogsParams): Promise<GetLogsResponse> => {
  const searchParams = buildSearchParams(params);
  const url = `/logs${toQueryString(searchParams)}`;
  return fetchJson<GetLogsResponse>(url);
};

/**
 * GET /spans
 * 스팬 검색
 */
export const getSpans = async (params?: GetSpansParams): Promise<GetSpansResponse> => {
  const searchParams = buildSearchParams(params);
  const url = `/spans${toQueryString(searchParams)}`;
  return fetchJson<GetSpansResponse>(url);
};

/**
 * GET /services/{serviceName}/endpoints
 * 서비스의 엔드포인트별 집계 메트릭 조회
 */
export const getServiceEndpoints = async (
  serviceName: string,
  params?: GetServiceEndpointsParams,
): Promise<GetServiceEndpointsResponse> => {
  const searchParams = buildSearchParams(params);
  const url = `/services/${serviceName}/endpoints${toQueryString(searchParams)}`;
  return fetchJson<GetServiceEndpointsResponse>(url);
};

/**
 * GET /services/{serviceName}/traces
 * 서비스 루트 트레이스 검색
 */
export const getServiceTraces = async (
  serviceName: string,
  params?: GetServiceTracesParams,
): Promise<GetServiceTracesResponse> => {
  const searchParams = buildSearchParams(params);
  const url = `/services/${serviceName}/traces${toQueryString(searchParams)}`;
  return fetchJson<GetServiceTracesResponse>(url);
};

/**
 * GET /services/{serviceName}/errors
 * 서비스의 에러 분포 및 통계 조회
 */
export const getServiceErrors = async (
  serviceName: string,
  params?: GetServiceErrorsParams,
): Promise<GetServiceErrorsResponse> => {
  const searchParams = buildSearchParams(params);
  const url = `/services/${serviceName}/errors${toQueryString(searchParams)}`;
  return fetchJson<GetServiceErrorsResponse>(url);
};
