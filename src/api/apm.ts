/**
 * APM API 호출 함수들
 * React Query의 queryFn에서 사용됩니다.
 */

import {
  ServicesResponse,
  IssuesResponse,
  ServiceMapResponse,
  ServiceMetricsResponse,
  ResourceResponse,
  ServiceDependenciesResponse,
  ServiceTracesResponse,
  ServiceLogStatsResponse,
  ServiceLogsResponse,
  ServiceErrorsResponse,
} from '@/types/apm';

/**
 * 공통 Fetch 헬퍼
 */
async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * 1.1 활성 서비스 목록 조회
 */
export const getServices = async (params?: {
  start_time?: string;
  end_time?: string;
  page?: number;
  size?: number;
}): Promise<ServicesResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.start_time) searchParams.append('start_time', params.start_time);
  if (params?.end_time) searchParams.append('end_time', params.end_time);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.size) searchParams.append('size', params.size.toString());

  const url = `/api/services${searchParams.toString() ? `?${searchParams}` : ''}`;
  return fetchJson<ServicesResponse>(url);
};

/**
 * 1.2 이슈 목록 조회
 */
export const getIssues = async (): Promise<IssuesResponse> => {
  return fetchJson<IssuesResponse>('/api/issues');
};

/**
 * 1.3 전체 서비스맵 조회
 */
export const getServiceMap = async (): Promise<ServiceMapResponse> => {
  return fetchJson<ServiceMapResponse>('/api/service-map');
};

/**
 * 2.1 서비스 메트릭 조회
 */
export const getServiceMetrics = async (
  serviceName: string,
  params?: {
    start_time?: string;
    end_time?: string;
    interval?: string;
  },
): Promise<ServiceMetricsResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.start_time) searchParams.append('start_time', params.start_time);
  if (params?.end_time) searchParams.append('end_time', params.end_time);
  if (params?.interval) searchParams.append('interval', params.interval);

  const url = `/api/services/${serviceName}/metrics${
    searchParams.toString() ? `?${searchParams}` : ''
  }`;
  return fetchJson<ServiceMetricsResponse>(url);
};

/**
 * 2.2 서비스 리소스 목록 조회
 */
export const getServiceResources = async (
  serviceName: string,
  params?: {
    start_time?: string;
    end_time?: string;
    sort_by?: string;
    page?: number;
    limit?: number;
  },
): Promise<ResourceResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.start_time) searchParams.append('start_time', params.start_time);
  if (params?.end_time) searchParams.append('end_time', params.end_time);
  if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const url = `/api/services/${serviceName}/resources${
    searchParams.toString() ? `?${searchParams}` : ''
  }`;
  return fetchJson<ResourceResponse>(url);
};

/**
 * 2.3 서비스 의존성 조회
 */
export const getServiceDependencies = async (
  serviceName: string,
  params?: {
    start_time?: string;
    end_time?: string;
  },
): Promise<ServiceDependenciesResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.start_time) searchParams.append('start_time', params.start_time);
  if (params?.end_time) searchParams.append('end_time', params.end_time);

  const url = `/api/services/${serviceName}/dependencies${
    searchParams.toString() ? `?${searchParams}` : ''
  }`;
  return fetchJson<ServiceDependenciesResponse>(url);
};

/**
 * 2.4 서비스 트레이스 목록 조회
 */
export const getServiceTraces = async (
  serviceName: string,
  params?: {
    start_time?: string;
    end_time?: string;
    status?: string;
    resource?: string;
    page?: number;
    limit?: number;
  },
): Promise<ServiceTracesResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.start_time) searchParams.append('start_time', params.start_time);
  if (params?.end_time) searchParams.append('end_time', params.end_time);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.resource) searchParams.append('resource', params.resource);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const url = `/api/services/${serviceName}/traces${
    searchParams.toString() ? `?${searchParams}` : ''
  }`;
  return fetchJson<ServiceTracesResponse>(url);
};

/**
 * 2.5 트레이스 상세 조회
 */
export const getTraceDetail = async (traceId: string) => {
  return fetchJson(`/api/traces/${traceId}`);
};

/**
 * 2.6 서비스 에러 목록 조회
 */
export const getServiceErrors = async (
  serviceName: string,
  params?: {
    start_time?: string;
    end_time?: string;
  },
): Promise<ServiceErrorsResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.start_time) searchParams.append('start_time', params.start_time);
  if (params?.end_time) searchParams.append('end_time', params.end_time);

  const url = `/api/services/${serviceName}/errors${
    searchParams.toString() ? `?${searchParams}` : ''
  }`;
  return fetchJson<ServiceErrorsResponse>(url);
};

/**
 * 2.7 서비스 로그 통계 조회
 */
export const getServiceLogStats = async (
  serviceName: string,
  params?: {
    start_time?: string;
    end_time?: string;
  },
): Promise<ServiceLogStatsResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.start_time) searchParams.append('start_time', params.start_time);
  if (params?.end_time) searchParams.append('end_time', params.end_time);

  const url = `/api/services/${serviceName}/logs/stats${
    searchParams.toString() ? `?${searchParams}` : ''
  }`;
  return fetchJson<ServiceLogStatsResponse>(url);
};

/**
 * 2.8 서비스 로그 목록 조회
 */
export const getServiceLogs = async (
  serviceName: string,
  params?: {
    level?: 'error' | 'warning' | 'info';
    page?: number;
    limit?: number;
  },
): Promise<ServiceLogsResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.level) searchParams.append('level', params.level);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const url = `/api/services/${serviceName}/logs${
    searchParams.toString() ? `?${searchParams}` : ''
  }`;
  return fetchJson<ServiceLogsResponse>(url);
};
