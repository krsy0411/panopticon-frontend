import { http, HttpResponse } from 'msw';

/**
 * MSW API Mock Handlers
 * 개발 환경에서만 활성화되며, 실제 API 요청을 가로채서 모킹된 응답을 반환합니다.
 */

export const handlers = [
  // 1.1 활성 서비스 목록 조회
  http.get('/api/services', () => {
    return HttpResponse.json({
      total_count: 25,
      page: 1,
      size: 10,
      services: [
        {
          service_name: 'user-service',
          service_type: 'API_GATEWAY',
          request_count: 15234,
          error_rate: 2.3,
          p95_latency_ms: 320,
          issues_count: 1,
        },
        {
          service_name: 'order-processor',
          service_type: 'WORKER',
          request_count: 8765,
          error_rate: 0.1,
          p95_latency_ms: 1500,
          issues_count: 0,
        },
        {
          service_name: 'payment-service',
          service_type: 'API',
          request_count: 12450,
          error_rate: 1.8,
          p95_latency_ms: 450,
          issues_count: 2,
        },
        {
          service_name: 'auth-service',
          service_type: 'API',
          request_count: 9876,
          error_rate: 0.5,
          p95_latency_ms: 180,
          issues_count: 0,
        },
        {
          service_name: 'notification-service',
          service_type: 'WORKER',
          request_count: 5432,
          error_rate: 3.2,
          p95_latency_ms: 2100,
          issues_count: 1,
        },
        {
          service_name: 'inventory-service',
          service_type: 'API',
          request_count: 11234,
          error_rate: 1.5,
          p95_latency_ms: 280,
          issues_count: 0,
        },
        {
          service_name: 'shipping-service',
          service_type: 'API',
          request_count: 7890,
          error_rate: 2.1,
          p95_latency_ms: 520,
          issues_count: 1,
        },
        {
          service_name: 'analytics-worker',
          service_type: 'WORKER',
          request_count: 4567,
          error_rate: 0.8,
          p95_latency_ms: 3200,
          issues_count: 0,
        },
        {
          service_name: 'email-service',
          service_type: 'API',
          request_count: 6543,
          error_rate: 1.2,
          p95_latency_ms: 890,
          issues_count: 0,
        },
        {
          service_name: 'search-service',
          service_type: 'API',
          request_count: 13456,
          error_rate: 0.9,
          p95_latency_ms: 420,
          issues_count: 0,
        },
      ],
    });
  }),

  // 1.2 이슈 목록 조회
  http.get('/api/issues', () => {
    return HttpResponse.json({
      issues: [
        {
          issue_id: 'iss_123',
          service_name: 'payment-service',
          message: 'Error rate exceeded 5%',
          occurred_at: '2025-11-07T10:30:00Z',
          affected_requests: 1234,
        },
        {
          issue_id: 'iss_124',
          service_name: 'user-service',
          message: 'High latency detected (>500ms)',
          occurred_at: '2025-11-07T10:45:00Z',
          affected_requests: 567,
        },
        {
          issue_id: 'iss_125',
          service_name: 'notification-service',
          message: 'Memory usage above 90%',
          occurred_at: '2025-11-07T10:20:00Z',
          affected_requests: 892,
        },
        {
          issue_id: 'iss_126',
          service_name: 'shipping-service',
          message: 'Database connection pool exhausted',
          occurred_at: '2025-11-07T10:15:00Z',
          affected_requests: 345,
        },
        {
          issue_id: 'iss_127',
          service_name: 'payment-service',
          message: 'Circuit breaker opened',
          occurred_at: '2025-11-07T10:50:00Z',
          affected_requests: 678,
        },
      ],
    });
  }),

  // 1.3 전체 서비스맵 조회
  http.get('/api/service-map', () => {
    return HttpResponse.json({
      nodes: [
        {
          service_name: 'api-gateway',
          service_type: 'web',
          request_count: 50000,
          error_rate: 1.2,
          avg_latency_ms: 100,
        },
        {
          service_name: 'user-service',
          service_type: 'api',
          request_count: 25000,
          error_rate: 2.3,
          avg_latency_ms: 150,
        },
        {
          service_name: 'payment-service',
          service_type: 'api',
          request_count: 15000,
          error_rate: 1.8,
          avg_latency_ms: 200,
        },
        {
          service_name: 'order-service',
          service_type: 'api',
          request_count: 18000,
          error_rate: 1.5,
          avg_latency_ms: 180,
        },
        {
          service_name: 'inventory-service',
          service_type: 'api',
          request_count: 12000,
          error_rate: 0.8,
          avg_latency_ms: 120,
        },
        {
          service_name: 'shipping-service',
          service_type: 'api',
          request_count: 8000,
          error_rate: 2.1,
          avg_latency_ms: 250,
        },
        {
          service_name: 'notification-service',
          service_type: 'worker',
          request_count: 20000,
          error_rate: 0.5,
          avg_latency_ms: 80,
        },
        {
          service_name: 'database',
          service_type: 'db',
          request_count: 100000,
          error_rate: 0.1,
          avg_latency_ms: 50,
        },
        {
          service_name: 'cache-redis',
          service_type: 'cache',
          request_count: 80000,
          error_rate: 0.05,
          avg_latency_ms: 10,
        },
        {
          service_name: 'auth-service',
          service_type: 'api',
          request_count: 30000,
          error_rate: 0.3,
          avg_latency_ms: 90,
        },
      ],
      edges: [
        {
          source: 'api-gateway',
          target: 'user-service',
          request_count: 25000,
          avg_latency_ms: 50,
          error_count: 100,
        },
        {
          source: 'api-gateway',
          target: 'payment-service',
          request_count: 15000,
          avg_latency_ms: 80,
          error_count: 50,
        },
        {
          source: 'api-gateway',
          target: 'order-service',
          request_count: 18000,
          avg_latency_ms: 60,
          error_count: 75,
        },
        {
          source: 'api-gateway',
          target: 'auth-service',
          request_count: 30000,
          avg_latency_ms: 40,
          error_count: 30,
        },
        {
          source: 'user-service',
          target: 'database',
          request_count: 50000,
          avg_latency_ms: 30,
          error_count: 20,
        },
        {
          source: 'user-service',
          target: 'cache-redis',
          request_count: 40000,
          avg_latency_ms: 8,
          error_count: 5,
        },
        {
          source: 'payment-service',
          target: 'database',
          request_count: 30000,
          avg_latency_ms: 40,
          error_count: 15,
        },
        {
          source: 'order-service',
          target: 'database',
          request_count: 35000,
          avg_latency_ms: 35,
          error_count: 18,
        },
        {
          source: 'order-service',
          target: 'inventory-service',
          request_count: 12000,
          avg_latency_ms: 70,
          error_count: 40,
        },
        {
          source: 'order-service',
          target: 'shipping-service',
          request_count: 8000,
          avg_latency_ms: 90,
          error_count: 60,
        },
        {
          source: 'order-service',
          target: 'notification-service',
          request_count: 10000,
          avg_latency_ms: 25,
          error_count: 10,
        },
        {
          source: 'inventory-service',
          target: 'database',
          request_count: 20000,
          avg_latency_ms: 45,
          error_count: 12,
        },
        {
          source: 'shipping-service',
          target: 'database',
          request_count: 15000,
          avg_latency_ms: 50,
          error_count: 25,
        },
        {
          source: 'auth-service',
          target: 'cache-redis',
          request_count: 25000,
          avg_latency_ms: 5,
          error_count: 3,
        },
        {
          source: 'auth-service',
          target: 'database',
          request_count: 18000,
          avg_latency_ms: 38,
          error_count: 8,
        },
      ],
    });
  }),

  // 2.1 Service Summary - 메트릭 그래프 데이터
  http.get('/api/services/:serviceName/metrics', ({ params, request }) => {
    const url = new URL(request.url);
    const startTime = url.searchParams.get('start_time');
    const endTime = url.searchParams.get('end_time');
    const interval = url.searchParams.get('interval') || '10m';
    const serviceName = params.serviceName;

    // 시간 범위 계산
    const start = startTime ? new Date(startTime) : new Date(Date.now() - 60 * 60 * 1000);
    const end = endTime ? new Date(endTime) : new Date();

    // interval에 따른 데이터 포인트 생성
    const intervalMs =
      {
        '1m': 60 * 1000,
        '5m': 5 * 60 * 1000,
        '10m': 10 * 60 * 1000,
        '30m': 30 * 60 * 1000,
        '1h': 60 * 60 * 1000,
      }[interval] || 10 * 60 * 1000;

    const dataPoints: string[] = [];
    for (let time = start.getTime(); time <= end.getTime(); time += intervalMs) {
      dataPoints.push(new Date(time).toISOString());
    }

    // payment-service 시나리오: 오후 4시(16:00)부터 에러 급증, 현재(4:30) 근처에서 최고조
    const now = new Date();
    const errorStartTime = new Date(now);
    errorStartTime.setHours(16, 0, 0, 0); // 오후 4시
    const currentTime = new Date(now);
    currentTime.setHours(16, 30, 0, 0); // 오후 4시 30분 (현재)

    if (serviceName === 'payment-service') {
      return HttpResponse.json({
        service_name: 'payment-service',
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        interval,
        data: {
          requests_and_errors: dataPoints.map((timestamp, index) => {
            const totalPoints = dataPoints.length;
            const isLastFewPoints = index >= totalPoints - 5; // 마지막 4-5개 포인트

            return {
              timestamp,
              hits: Math.floor(Math.random() * 200) + 1000,
              // 대부분: 4~6 높이, 오른쪽 끝 4-5개: 8~9 높이
              errors: isLastFewPoints
                ? Math.floor(Math.random() * 2) + 8 // 8~9
                : Math.floor(Math.random() * 3) + 4, // 4~6
            };
          }),
          errors_by_status: dataPoints.map((timestamp, index) => {
            const totalPoints = dataPoints.length;
            const isLastFewPoints = index >= totalPoints - 5; // 마지막 4-5개 포인트

            return {
              timestamp,
              // 대부분: 2~4 높이, 오른쪽 끝 4-5개: 5~6 높이
              status_500: isLastFewPoints
                ? Math.floor(Math.random() * 2) + 5 // 5~6
                : Math.floor(Math.random() * 3) + 2, // 2~4
              status_502: Math.floor(Math.random() * 2) + 1,
              status_503: isLastFewPoints
                ? Math.floor(Math.random() * 2) + 2 // 2~3
                : Math.floor(Math.random() * 2) + 1, // 1~2
              status_504: Math.floor(Math.random() * 2) + 1,
            };
          }),
          latency: dataPoints.map((timestamp) => ({
            timestamp,
            // Latency는 평소와 비슷하게 유지 (~200ms)
            p99_9: Math.floor(Math.random() * 50) + 250,
            p95: Math.floor(Math.random() * 30) + 185,
            p90: Math.floor(Math.random() * 20) + 170,
          })),
        },
      });
    }

    return HttpResponse.json({
      service_name: serviceName as string,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      interval,
      data: {
        requests_and_errors: dataPoints.map((timestamp) => ({
          timestamp,
          hits: Math.floor(Math.random() * 300) + 1200,
          errors: Math.floor(Math.random() * 20) + 10,
        })),
        errors_by_status: dataPoints.map((timestamp) => ({
          timestamp,
          status_500: Math.floor(Math.random() * 10) + 8,
          status_502: Math.floor(Math.random() * 5) + 1,
          status_503: Math.floor(Math.random() * 4) + 1,
          status_504: Math.floor(Math.random() * 4) + 1,
        })),
        latency: dataPoints.map((timestamp) => ({
          timestamp,
          p99_9: Math.floor(Math.random() * 100) + 400,
          p95: Math.floor(Math.random() * 50) + 220,
          p90: Math.floor(Math.random() * 30) + 145,
        })),
      },
    });
  }),

  // 2.2 Resources - 리소스 목록
  http.get('/api/services/:serviceName/resources', ({ params, request }) => {
    const url = new URL(request.url);
    const startTime = url.searchParams.get('start_time');
    const endTime = url.searchParams.get('end_time');
    const serviceName = params.serviceName;

    // 150개의 resource 데이터 동적 생성
    const allResources = [];
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    // payment-service의 경우 결제/DB 관련 엔드포인트만
    let endpoints: string[];
    if (serviceName === 'payment-service') {
      endpoints = [
        '/api/payments/process',
        '/api/payments/:id',
        '/api/payments/refund',
        '/api/payments/validate',
        '/api/payments/history',
        '/api/payments/create',
        '/api/payments/:id/status',
        '/api/payments/transactions',
        '/api/payments/:id/details',
        '/api/payments/search',
      ];
    } else {
      endpoints = [
        '/api/users',
        '/api/users/:id',
        '/api/users/:id/profile',
        '/api/users/:id/orders',
        '/api/users/:id/avatar',
        '/api/users/:id/settings',
        '/api/users/:id/notifications',
        '/api/users/search',
        '/api/users/batch',
        '/api/orders',
        '/api/orders/:id',
        '/api/orders/:id/items',
        '/api/products',
        '/api/products/:id',
        '/api/products/search',
        '/api/payments',
        '/api/payments/:id',
        '/api/cart',
        '/api/cart/items',
        '/api/reviews',
      ];
    }

    const now = new Date();

    for (let i = 0; i < 150; i++) {
      const method = methods[i % methods.length];
      const endpoint = endpoints[i % endpoints.length];
      const resourceName = `${method} ${endpoint}`;

      const requests = Math.floor(Math.random() * 15000) + 1000; // 1000-16000
      const avgTimeMs = Math.floor(Math.random() * 300) + 50; // 50-350ms
      const totalTimeMs = requests * avgTimeMs;
      const p95LatencyMs = avgTimeMs + Math.floor(Math.random() * 200) + 50; // avg + 50-250ms
      const errors = Math.floor(requests * (Math.random() * 0.05)); // 0-5% error
      const errorRate = (errors / requests) * 100;
      const updatedAt = new Date(now.getTime() - i * 60000); // 1분씩 과거로

      allResources.push({
        resource_name: resourceName,
        requests,
        total_time_ms: totalTimeMs,
        avg_time_ms: avgTimeMs,
        p95_latency_ms: p95LatencyMs,
        errors,
        error_rate: parseFloat(errorRate.toFixed(2)),
        updated_at: updatedAt.toISOString(),
      });
    }

    // 시간 범위 필터링
    let filteredResources = allResources;
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      filteredResources = allResources.filter((resource) => {
        const resourceTime = new Date(resource.updated_at);
        return resourceTime >= start && resourceTime <= end;
      });
    }

    return HttpResponse.json({
      resources: filteredResources,
      total: filteredResources.length,
      page: 1,
      limit: 150,
    });
  }),

  // 2.3 Dependencies - 서비스 의존성 맵
  http.get('/api/services/:serviceName/dependencies', ({ params, request }) => {
    const url = new URL(request.url);
    const startTime = url.searchParams.get('start_time');
    const endTime = url.searchParams.get('end_time');
    const serviceName = params.serviceName;

    // 시간 범위 계산 (기본값: 지난 1시간)
    const start = startTime ? new Date(startTime) : new Date(Date.now() - 60 * 60 * 1000);
    const end = endTime ? new Date(endTime) : new Date();
    const timeRangeInSeconds = (end.getTime() - start.getTime()) / 1000;

    // 시간 범위에 비례한 요청 수 계산 (기준: 1시간 = 3600초)
    const baseMultiplier = timeRangeInSeconds / 3600;

    // payment-service 시나리오
    if (serviceName === 'payment-service') {
      return HttpResponse.json({
        service_name: 'payment-service',
        incoming_requests: [
          {
            service_name: 'api-gateway',
            total_requests: Math.floor(28000 * baseMultiplier),
            error_rate: 0.3,
          },
          {
            service_name: 'order-service',
            total_requests: Math.floor(42000 * baseMultiplier),
            error_rate: 0.4,
          },
          {
            service_name: 'user-service',
            total_requests: Math.floor(15000 * baseMultiplier),
            error_rate: 0.2,
          },
        ],
        outgoing_requests: [
          {
            service_name: 'auth-service',
            total_requests: Math.floor(35000 * baseMultiplier),
            error_rate: 0.2, // 정상 (초록색)
          },
          {
            service_name: 'postgres',
            total_requests: Math.floor(40000 * baseMultiplier),
            error_rate: 0.78, // 심각한 에러 (빨간색) - 78%
          },
          {
            service_name: 'redis-cache',
            total_requests: Math.floor(22000 * baseMultiplier),
            error_rate: 0.1,
          },
          {
            service_name: 'notification-service',
            total_requests: Math.floor(8000 * baseMultiplier),
            error_rate: 0.5,
          },
        ],
      });
    }

    return HttpResponse.json({
      service_name: serviceName as string,
      incoming_requests: [
        {
          service_name: 'api-gateway',
          total_requests: Math.floor(54000 * baseMultiplier),
          error_rate: 0.5,
        },
        {
          service_name: 'admin-service',
          total_requests: Math.floor(12000 * baseMultiplier),
          error_rate: 0.3,
        },
        {
          service_name: 'order-service',
          total_requests: Math.floor(8500 * baseMultiplier),
          error_rate: 0.4,
        },
        {
          service_name: 'notification-service',
          total_requests: Math.floor(6200 * baseMultiplier),
          error_rate: 0.2,
        },
      ],
      outgoing_requests: [
        {
          service_name: 'database',
          total_requests: Math.floor(162000 * baseMultiplier),
          error_rate: 0.1,
        },
        {
          service_name: 'cache-service',
          total_requests: Math.floor(108000 * baseMultiplier),
          error_rate: 0.05,
        },
        {
          service_name: 'payment-service',
          total_requests: Math.floor(45000 * baseMultiplier),
          error_rate: 0.8,
        },
        {
          service_name: 'auth-service',
          total_requests: Math.floor(32000 * baseMultiplier),
          error_rate: 0.3,
        },
        {
          service_name: 'analytics-service',
          total_requests: Math.floor(18500 * baseMultiplier),
          error_rate: 0.6,
        },
        {
          service_name: 'email-service',
          total_requests: Math.floor(12300 * baseMultiplier),
          error_rate: 0.4,
        },
      ],
    });
  }),

  // 2.4 Traces - 트레이스 목록
  http.get('/api/services/:serviceName/traces', ({ params, request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '30');
    const page = parseInt(url.searchParams.get('page') || '1');
    const startTime = url.searchParams.get('start_time');
    const endTime = url.searchParams.get('end_time');
    const serviceName = params.serviceName;

    const now = new Date();
    const allTraces = [];

    // payment-service 전용 traces (DB 에러 많이 포함)
    if (serviceName === 'payment-service') {
      const paymentResources = [
        'POST /api/payments/process',
        'GET /api/payments/:id',
        'POST /api/payments/refund',
        'POST /api/payments/validate',
        'GET /api/payments/history',
        'POST /api/payments/create',
        'PUT /api/payments/:id/status',
        'GET /api/payments/transactions',
      ];
      const methods = ['GET', 'POST', 'PUT'];
      // DB 에러가 많으므로 500, 503 에러 비율 증가
      const statusCodes = [200, 200, 200, 500, 500, 500, 503, 503, 504, 500];

      for (let i = 0; i < 150; i++) {
        const statusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)];
        const isError = statusCode >= 400;
        const resource = paymentResources[Math.floor(Math.random() * paymentResources.length)];
        const traceDate = new Date(now.getTime() - i * 60000); // 1분씩 과거로

        allTraces.push({
          trace_id: `trace_${i.toString().padStart(5, '0')}`,
          date: traceDate.toISOString(),
          resource,
          service: 'payment-service',
          duration_ms: isError
            ? Math.floor(Math.random() * 3000) + 5000 // 에러 시 5~8초 (타임아웃)
            : Math.floor(Math.random() * 300) + 100, // 정상 시 100~400ms
          method: methods[Math.floor(Math.random() * methods.length)],
          status_code: statusCode,
          span_count: Math.floor(Math.random() * 8) + 3,
          error: isError,
        });
      }
    } else {
      // 기본 서비스 traces
      const resources = [
        'GET /api/users',
        'POST /api/users',
        'PUT /api/users/:id',
        'DELETE /api/users/:id',
        'GET /api/users/search',
        'GET /api/users/profile',
        'POST /api/users/batch',
        'GET /api/users/notifications',
        'GET /api/orders',
        'POST /api/orders',
      ];
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];
      const statusCodes = [200, 200, 200, 200, 200, 400, 500, 502, 503, 504]; // 성공이 더 많도록

      for (let i = 0; i < 150; i++) {
        const statusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)];
        const isError = statusCode >= 400;
        const resource = resources[Math.floor(Math.random() * resources.length)];
        const traceDate = new Date(now.getTime() - i * 60000); // 1분씩 과거로

        allTraces.push({
          trace_id: `trace_${i.toString().padStart(5, '0')}`,
          date: traceDate.toISOString(),
          resource,
          service: 'user-service',
          duration_ms: Math.floor(Math.random() * 900) + 50, // 50-950ms
          method: methods[Math.floor(Math.random() * methods.length)],
          status_code: statusCode,
          span_count: Math.floor(Math.random() * 10) + 2,
          error: isError,
        });
      }
    }

    // 시간 범위 필터링
    let filteredTraces = allTraces;
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      filteredTraces = allTraces.filter((trace) => {
        const traceTime = new Date(trace.date);
        return traceTime >= start && traceTime <= end;
      });
    }

    // 페이지네이션 적용
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTraces = filteredTraces.slice(startIndex, endIndex);

    return HttpResponse.json({
      traces: paginatedTraces,
      total: filteredTraces.length,
      page,
      limit,
    });
  }),

  // 2.5 Trace 상세 - Span 목록
  http.get('/api/traces/:traceId', () => {
    return HttpResponse.json({
      trace_id: 'trace_abc123',
      start_time: '2025-11-07T10:35:22.000Z',
      duration_ms: 234,
      service_count: 2,
      spans: [
        {
          span_id: 'span_001',
          parent_span_id: null,
          service: 'api-gateway',
          operation: 'http.request',
          resource: 'GET /api/users/123',
          start_time_offset_ms: 0,
          duration_ms: 234,
          status: 'ok',
          tags: {
            'http.method': 'GET',
            'http.status_code': 200,
          },
          error: false,
        },
        {
          span_id: 'span_002',
          parent_span_id: 'span_001',
          service: 'user-service',
          operation: 'database.query',
          resource: 'SELECT * FROM users WHERE id=?',
          start_time_offset_ms: 10,
          duration_ms: 180,
          status: 'ok',
          error: false,
        },
        {
          span_id: 'span_003',
          parent_span_id: 'span_001',
          service: 'user-service',
          operation: 'serialize',
          resource: 'JSON serialization',
          start_time_offset_ms: 200,
          duration_ms: 25,
          status: 'ok',
          error: false,
        },
      ],
    });
  }),

  // 2.6 Errors - 에러 목록
  http.get('/api/services/:serviceName/errors', ({ params, request }) => {
    const url = new URL(request.url);
    const startTime = url.searchParams.get('start_time');
    const endTime = url.searchParams.get('end_time');
    const serviceName = params.serviceName;

    // 시간 범위 계산
    const start = startTime ? new Date(startTime) : new Date(Date.now() - 60 * 60 * 1000);
    const end = endTime ? new Date(endTime) : new Date();
    const timeRangeInSeconds = (end.getTime() - start.getTime()) / 1000;

    // 시간 범위에 비례한 데이터 개수 조정 (기준: 1시간 = 3600초, 기본 50개)
    const baseMultiplier = timeRangeInSeconds / 3600;
    const errorCount = Math.min(Math.floor(50 * baseMultiplier), 150); // 최대 150개

    // payment-service 전용 에러 템플릿 (연관된 서비스들 포함)
    if (serviceName === 'payment-service') {
      const errors: Array<{
        error_id: string;
        error_message: string;
        resource: string;
        stack_trace: string;
        service_name: string;
        count: number;
        first_seen: string;
        last_seen: string;
        sample_trace_ids: string[];
      }> = [];

      // 1. payment-service 에러 (주요 에러, 78%)
      const paymentErrorTemplates = [
        {
          error_message: 'Database connection timeout',
          resource: 'POST /api/payments/process',
          stack_trace:
            'Error: Connection timeout after 5000ms\n  at PostgresClient.connect (postgres.js:123)\n  at PaymentService.processPayment (payment.js:45)',
          count: 324, // 1247 * 0.78 / 3 ≈ 324
        },
        {
          error_message: 'Database connection timeout',
          resource: 'GET /api/payments/:id',
          stack_trace:
            'Error: Connection timeout after 5000ms\n  at PostgresClient.connect (postgres.js:123)\n  at PaymentService.getPayment (payment.js:67)',
          count: 324,
        },
        {
          error_message: 'Database connection timeout',
          resource: 'POST /api/payments/refund',
          stack_trace:
            'Error: Connection timeout after 5000ms\n  at PostgresClient.connect (postgres.js:123)\n  at PaymentService.refundPayment (payment.js:89)',
          count: 324,
        },
        {
          error_message: 'Failed to connect to database pool',
          resource: 'POST /api/payments/validate',
          stack_trace:
            'Error: Connection pool exhausted\n  at PostgresPool.getConnection (pool.js:234)\n  at PaymentService.validatePayment (payment.js:156)',
          count: 137, // 1247 * 0.22 / 2 ≈ 137
        },
        {
          error_message: 'Database query timeout',
          resource: 'GET /api/payments/history',
          stack_trace:
            'Error: Query timeout after 5000ms\n  at PostgresClient.query (postgres.js:345)\n  at PaymentService.getHistory (payment.js:201)',
          count: 138,
        },
      ];

      // 2. postgres 에러 (데이터베이스 측 문제) - payment-service와 비슷한 수준으로 증가
      const postgresErrorTemplates = [
        {
          error_message: 'Connection pool exhausted',
          resource: 'CONNECTION POOL',
          stack_trace:
            'Error: Maximum connection pool size reached\n  at ConnectionPool.acquire (pool.js:234)\n  at PostgresDB.connect (postgres.js:89)',
          count: 520,
        },
        {
          error_message: 'Too many connections',
          resource: 'MAX CONNECTIONS',
          stack_trace:
            'Error: FATAL - too many connections for database\n  at PostgresDB.connect (postgres.js:45)\n  at ConnectionManager.getConnection (manager.js:123)',
          count: 380,
        },
        {
          error_message: 'Query execution timeout',
          resource: 'SELECT payment_transactions',
          stack_trace:
            'Error: Query timeout after 5000ms\n  at QueryExecutor.execute (executor.js:156)\n  at PostgresDB.query (postgres.js:234)',
          count: 340,
        },
        {
          error_message: 'Deadlock detected',
          resource: 'UPDATE payment_status',
          stack_trace:
            'Error: Deadlock detected in transaction\n  at Transaction.commit (transaction.js:345)\n  at PostgresDB.executeTransaction (postgres.js:456)',
          count: 280,
        },
        {
          error_message: 'Connection refused',
          resource: 'TCP CONNECTION',
          stack_trace:
            'Error: Connection refused by server\n  at TCPConnection.connect (tcp.js:234)\n  at PostgresDB.connect (postgres.js:67)',
          count: 195,
        },
      ];

      // 3. order-service 에러 (상위 서비스에서도 영향 받음)
      const orderServiceErrorTemplates = [
        {
          error_message: 'Payment service timeout',
          resource: 'POST /api/orders/checkout',
          stack_trace:
            'Error: Timeout calling payment-service\n  at HttpClient.post (http.js:123)\n  at OrderService.processCheckout (order.js:234)',
          count: 234,
        },
        {
          error_message: 'Payment validation failed',
          resource: 'POST /api/orders/validate',
          stack_trace:
            'Error: Payment validation failed\n  at PaymentClient.validate (client.js:89)\n  at OrderService.validateOrder (order.js:156)',
          count: 156,
        },
      ];

      let errorId = 456;

      // payment-service 에러 추가
      paymentErrorTemplates.forEach((template) => {
        const firstSeen = new Date(
          start.getTime() + Math.random() * (end.getTime() - start.getTime()) * 0.3,
        );
        const lastSeen = new Date(
          end.getTime() - Math.random() * (end.getTime() - start.getTime()) * 0.1,
        );

        errors.push({
          error_id: `err_${errorId.toString().padStart(5, '0')}`,
          error_message: template.error_message,
          resource: template.resource,
          stack_trace: template.stack_trace,
          service_name: 'payment-service',
          count: template.count,
          first_seen: firstSeen.toISOString(),
          last_seen: lastSeen.toISOString(),
          sample_trace_ids: [`trace_${errorId * 100}`, `trace_${errorId * 100 + 1}`],
        });
        errorId++;
      });

      // postgres 에러 추가
      postgresErrorTemplates.forEach((template) => {
        const firstSeen = new Date(
          start.getTime() + Math.random() * (end.getTime() - start.getTime()) * 0.3,
        );
        const lastSeen = new Date(
          end.getTime() - Math.random() * (end.getTime() - start.getTime()) * 0.1,
        );

        errors.push({
          error_id: `err_${errorId.toString().padStart(5, '0')}`,
          error_message: template.error_message,
          resource: template.resource,
          stack_trace: template.stack_trace,
          service_name: 'postgres',
          count: template.count,
          first_seen: firstSeen.toISOString(),
          last_seen: lastSeen.toISOString(),
          sample_trace_ids: [`trace_${errorId * 100}`, `trace_${errorId * 100 + 1}`],
        });
        errorId++;
      });

      // order-service 에러 추가
      orderServiceErrorTemplates.forEach((template) => {
        const firstSeen = new Date(
          start.getTime() + Math.random() * (end.getTime() - start.getTime()) * 0.3,
        );
        const lastSeen = new Date(
          end.getTime() - Math.random() * (end.getTime() - start.getTime()) * 0.1,
        );

        errors.push({
          error_id: `err_${errorId.toString().padStart(5, '0')}`,
          error_message: template.error_message,
          resource: template.resource,
          stack_trace: template.stack_trace,
          service_name: 'order-service',
          count: template.count,
          first_seen: firstSeen.toISOString(),
          last_seen: lastSeen.toISOString(),
          sample_trace_ids: [`trace_${errorId * 100}`, `trace_${errorId * 100 + 1}`],
        });
        errorId++;
      });

      return HttpResponse.json({
        errors,
        total: errors.length,
        page: 1,
        limit: errors.length,
      });
    }

    const errorTemplates = [
      {
        error_message: 'Failed to connect to database',
        resource: 'GET /api/users/:id',
        stack_trace:
          'Error: Connection timeout\n  at Database.connect (db.js:45)\n  at UserService.getUser (service.js:23)',
      },
      {
        error_message: 'Validation error: Invalid user ID format',
        resource: 'GET /api/users/:id',
        stack_trace:
          'ValidationError: ID must be numeric\n  at validateId (validator.js:12)\n  at UserController.getUser (controller.js:34)',
      },
      {
        error_message: 'Service unavailable',
        resource: 'POST /api/users',
        stack_trace:
          'Error: Service temporarily unavailable\n  at ServiceRegistry.getService (registry.js:67)',
      },
      {
        error_message: 'Authentication failed',
        resource: 'POST /api/users/login',
        stack_trace:
          'AuthError: Invalid credentials\n  at AuthService.authenticate (auth.js:89)\n  at LoginController.handleLogin (login.js:45)',
      },
      {
        error_message: 'Rate limit exceeded',
        resource: 'GET /api/users/search',
        stack_trace:
          'RateLimitError: Too many requests\n  at RateLimiter.check (limiter.js:34)\n  at Middleware.rateLimitCheck (middleware.js:56)',
      },
      {
        error_message: 'Resource not found',
        resource: 'GET /api/users/:id/profile',
        stack_trace:
          'NotFoundError: User profile not found\n  at ProfileService.getProfile (profile.js:78)\n  at ProfileController.get (controller.js:23)',
      },
      {
        error_message: 'Memory allocation failed',
        resource: 'POST /api/users/batch',
        stack_trace:
          'MemoryError: Out of memory\n  at MemoryManager.allocate (memory.js:156)\n  at BatchProcessor.process (batch.js:89)',
      },
      {
        error_message: 'Network timeout',
        resource: 'GET /api/users/notifications',
        stack_trace:
          'TimeoutError: Request timeout after 30000ms\n  at HttpClient.request (http.js:234)\n  at NotificationService.fetch (notification.js:67)',
      },
      {
        error_message: 'SQL syntax error',
        resource: 'GET /api/users/search',
        stack_trace:
          'SQLError: Invalid SQL syntax\n  at QueryBuilder.build (query.js:123)\n  at SearchService.execute (search.js:45)',
      },
      {
        error_message: 'Permission denied',
        resource: 'DELETE /api/users/:id',
        stack_trace:
          'PermissionError: Insufficient permissions\n  at AuthMiddleware.checkPermission (auth.js:178)\n  at UserController.delete (controller.js:89)',
      },
      {
        error_message: 'Invalid JSON format',
        resource: 'POST /api/users',
        stack_trace:
          'JSONParseError: Unexpected token\n  at JSON.parse (native)\n  at RequestParser.parse (parser.js:34)',
      },
      {
        error_message: 'Cache connection lost',
        resource: 'GET /api/users/:id/profile',
        stack_trace:
          'CacheError: Redis connection lost\n  at RedisClient.get (redis.js:92)\n  at CacheService.fetch (cache.js:45)',
      },
      {
        error_message: 'File system error',
        resource: 'POST /api/users/:id/avatar',
        stack_trace:
          'FSError: Failed to write file\n  at FileSystem.write (fs.js:234)\n  at AvatarService.save (avatar.js:78)',
      },
      {
        error_message: 'Circular dependency detected',
        resource: 'GET /api/users/:id/orders',
        stack_trace:
          'DependencyError: Circular reference\n  at DependencyResolver.resolve (resolver.js:156)\n  at OrderService.load (order.js:34)',
      },
      {
        error_message: 'Token expired',
        resource: 'GET /api/users/:id/settings',
        stack_trace:
          'TokenError: JWT token expired\n  at TokenValidator.validate (token.js:89)\n  at AuthMiddleware.verify (auth.js:123)',
      },
      {
        error_message: 'Database deadlock',
        resource: 'PUT /api/users/:id',
        stack_trace:
          'DeadlockError: Transaction deadlock detected\n  at Transaction.commit (transaction.js:234)\n  at UserService.update (service.js:156)',
      },
      {
        error_message: 'Invalid email format',
        resource: 'POST /api/users',
        stack_trace:
          'ValidationError: Email format invalid\n  at EmailValidator.validate (validator.js:45)\n  at UserController.create (controller.js:78)',
      },
      {
        error_message: 'Service circuit breaker open',
        resource: 'GET /api/users/:id/orders',
        stack_trace:
          'CircuitBreakerError: Circuit breaker is open\n  at CircuitBreaker.call (breaker.js:123)\n  at OrderService.fetch (order.js:67)',
      },
      {
        error_message: 'Request body too large',
        resource: 'POST /api/users/batch',
        stack_trace:
          'PayloadError: Request entity too large\n  at BodyParser.parse (parser.js:89)\n  at Middleware.parseBody (middleware.js:45)',
      },
      {
        error_message: 'Concurrent modification error',
        resource: 'PUT /api/users/:id',
        stack_trace:
          'ConcurrencyError: Resource modified by another request\n  at OptimisticLock.check (lock.js:156)\n  at UserService.update (service.js:89)',
      },
    ];

    // 다양한 서비스 목록
    const services = [
      'user-service',
      'payment-service',
      'order-service',
      'notification-service',
      'auth-service',
      'inventory-service',
    ];

    // 시간 범위에 비례한 에러 데이터 생성
    const errors = [];
    for (let i = 0; i < errorCount; i++) {
      const template = errorTemplates[i % errorTemplates.length];
      const serviceName = services[i % services.length]; // 서비스 순환 할당

      const firstSeen = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime()) * 0.3,
      );
      const lastSeen = new Date(
        end.getTime() - Math.random() * (end.getTime() - start.getTime()) * 0.1,
      );

      // 에러 카운트도 시간 범위에 비례
      const baseErrorCount = Math.floor(Math.random() * 200) + 50;
      const scaledErrorCount = Math.floor(baseErrorCount * baseMultiplier);

      errors.push({
        error_id: `err_${(456 + i).toString().padStart(5, '0')}`,
        error_message: template.error_message,
        resource: template.resource,
        stack_trace: template.stack_trace,
        service_name: serviceName,
        count: Math.max(scaledErrorCount, 1), // 최소 1개
        first_seen: firstSeen.toISOString(),
        last_seen: lastSeen.toISOString(),
        sample_trace_ids: [`trace_${i * 100}`, `trace_${i * 100 + 1}`],
      });
    }

    return HttpResponse.json({
      errors,
      total: errors.length,
      page: 1,
      limit: errorCount,
    });
  }),

  // 2.7.1 로그 통계 조회
  http.get('/api/services/:serviceName/logs/stats', ({ params, request }) => {
    const url = new URL(request.url);
    const startTime = url.searchParams.get('start_time');
    const endTime = url.searchParams.get('end_time');
    const serviceName = params.serviceName;

    // 시간 범위 계산
    const start = startTime ? new Date(startTime) : new Date(Date.now() - 60 * 60 * 1000);
    const end = endTime ? new Date(endTime) : new Date();
    const timeRangeInSeconds = (end.getTime() - start.getTime()) / 1000;

    // 시간 범위에 비례한 로그 수 계산 (기준: 1시간 = 3600초)
    const baseMultiplier = timeRangeInSeconds / 3600;

    // payment-service 전용 로그 통계
    if (serviceName === 'payment-service') {
      const errorCount = Math.floor(1247 * baseMultiplier); // 1,247건의 에러
      const warningCount = Math.floor(234 * baseMultiplier);
      const infoCount = Math.floor(8956 * baseMultiplier);
      const totalLogs = errorCount + warningCount + infoCount;

      return HttpResponse.json({
        service_name: 'payment-service',
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        total_logs: totalLogs,
        error_count: errorCount,
        warning_count: warningCount,
        info_count: infoCount,
        breakdown: [
          {
            level: 'error',
            count: errorCount,
            percentage: parseFloat(((errorCount / totalLogs) * 100).toFixed(2)),
          },
          {
            level: 'warning',
            count: warningCount,
            percentage: parseFloat(((warningCount / totalLogs) * 100).toFixed(2)),
          },
          {
            level: 'info',
            count: infoCount,
            percentage: parseFloat(((infoCount / totalLogs) * 100).toFixed(2)),
          },
        ],
      });
    }

    const errorCount = Math.floor(567 * baseMultiplier);
    const warningCount = Math.floor(1234 * baseMultiplier);
    const infoCount = Math.floor(13433 * baseMultiplier);
    const totalLogs = errorCount + warningCount + infoCount;

    return HttpResponse.json({
      service_name: serviceName as string,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      total_logs: totalLogs,
      error_count: errorCount,
      warning_count: warningCount,
      info_count: infoCount,
      breakdown: [
        {
          level: 'error',
          count: errorCount,
          percentage: parseFloat(((errorCount / totalLogs) * 100).toFixed(2)),
        },
        {
          level: 'warning',
          count: warningCount,
          percentage: parseFloat(((warningCount / totalLogs) * 100).toFixed(2)),
        },
        {
          level: 'info',
          count: infoCount,
          percentage: parseFloat(((infoCount / totalLogs) * 100).toFixed(2)),
        },
      ],
    });
  }),

  // 2.7.2 로그 목록 조회
  http.get('/api/services/:serviceName/logs', ({ params, request }) => {
    const url = new URL(request.url);
    const level = url.searchParams.get('level') || 'error';
    const startTime = url.searchParams.get('start_time');
    const endTime = url.searchParams.get('end_time');
    const serviceName = params.serviceName;

    // 시간 범위 계산
    const start = startTime ? new Date(startTime) : new Date(Date.now() - 60 * 60 * 1000);
    const end = endTime ? new Date(endTime) : new Date();

    // payment-service 전용 로그
    if (serviceName === 'payment-service' && level === 'error') {
      const paymentErrorLogs = [
        'Failed to connect to database: Connection timeout after 5000ms',
        'Failed to connect to database: Connection timeout after 5000ms',
        'Failed to connect to database: Connection timeout after 5000ms',
        'Database connection pool exhausted',
        'Failed to connect to database: Connection timeout after 5000ms',
        'Database query timeout after 5000ms',
        'Failed to connect to database: Connection timeout after 5000ms',
        'Failed to connect to database: Connection timeout after 5000ms',
        'PostgreSQL connection refused',
        'Failed to connect to database: Connection timeout after 5000ms',
      ];

      const paymentErrorTypes = [
        'DatabaseConnectionError',
        'DatabaseConnectionError',
        'DatabaseConnectionError',
        'ConnectionPoolError',
        'DatabaseConnectionError',
        'QueryTimeoutError',
        'DatabaseConnectionError',
        'DatabaseConnectionError',
        'ConnectionRefusedError',
        'DatabaseConnectionError',
      ];

      const paymentPaths = [
        '/api/payments/process',
        '/api/payments/process',
        '/api/payments/:id',
        '/api/payments/validate',
        '/api/payments/refund',
        '/api/payments/history',
        '/api/payments/process',
        '/api/payments/:id',
        '/api/payments/status',
        '/api/payments/process',
      ];

      const logs = [];
      const logCount = 150;

      for (let i = 0; i < logCount; i++) {
        const randomTime = new Date(
          start.getTime() + Math.random() * (end.getTime() - start.getTime()),
        );

        logs.push({
          log_id: `log_${Date.now()}_${i.toString().padStart(5, '0')}`,
          timestamp: randomTime.toISOString(),
          level: 'error',
          service: 'payment-service',
          message: paymentErrorLogs[i % paymentErrorLogs.length],
          trace_id: `trace_${Math.random().toString(36).substring(7)}`,
          span_id: `span_${Math.random().toString(36).substring(7)}`,
          attributes: {
            'error.type': paymentErrorTypes[i % paymentErrorTypes.length],
            'request.path': paymentPaths[i % paymentPaths.length],
            'user.id': Math.floor(Math.random() * 10000),
            'request.duration_ms': Math.floor(Math.random() * 5500) + 5000,
            'database.host': 'postgres.internal',
            'database.port': 5432,
          },
        });
      }

      // 시간 역순으로 정렬 (최신 로그가 먼저)
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return HttpResponse.json({
        logs,
        total: logs.length,
        page: 1,
        limit: 150,
        filtered_level: level,
      });
    }

    const logMessages = {
      error: [
        'Database connection timeout',
        'Failed to process user request',
        'Invalid input parameters',
        'Service temporarily unavailable',
        'Authentication failed',
        'Memory allocation failed',
        'Network request timeout',
        'SQL syntax error in query',
        'Permission denied for resource',
        'Invalid JSON format received',
        'Cache connection lost',
        'File system write error',
        'Circular dependency detected',
        'JWT token expired',
        'Database transaction deadlock',
        'Invalid email format',
        'Circuit breaker opened',
        'Request body too large',
        'Concurrent modification detected',
        'Redis connection refused',
      ],
      warning: [
        'High memory usage detected',
        'Slow query performance',
        'Deprecated API endpoint used',
        'Rate limit approaching',
        'Cache miss rate high',
        'Database connection pool low',
        'CPU usage above threshold',
        'Disk space running low',
        'Response time degradation',
        'Unusual traffic pattern',
        'Old client version detected',
        'Legacy code path executed',
        'Retry count increasing',
        'Queue length growing',
        'Session timeout approaching',
      ],
      info: [
        'User request processed successfully',
        'Database query completed',
        'Cache hit',
        'API endpoint called',
        'Request handled',
        'User authenticated',
        'Data validation passed',
        'Resource created',
        'Resource updated',
        'Resource deleted',
        'Email sent successfully',
        'File uploaded',
        'Batch job started',
        'Batch job completed',
        'Health check passed',
      ],
    };

    const errorTypes = {
      error: [
        'TimeoutError',
        'ProcessingError',
        'ValidationError',
        'ServiceError',
        'AuthError',
        'MemoryError',
        'NetworkError',
        'SQLError',
        'PermissionError',
        'JSONParseError',
        'CacheError',
        'FileSystemError',
        'DependencyError',
        'TokenError',
        'DeadlockError',
        'CircuitBreakerError',
        'PayloadError',
        'ConcurrencyError',
        'ConnectionError',
        'DataError',
      ],
      warning: [
        'PerformanceWarning',
        'DeprecationWarning',
        'ResourceWarning',
        'ThresholdWarning',
        'PatternWarning',
        'VersionWarning',
        'ConfigWarning',
        'CapacityWarning',
        'TimeoutWarning',
        'QueueWarning',
      ],
      info: [
        'Info',
        'Success',
        'Processed',
        'Authenticated',
        'Validated',
        'Created',
        'Updated',
        'Deleted',
        'Sent',
        'Uploaded',
      ],
    };

    const requestPaths = [
      '/api/users',
      '/api/users/:id',
      '/api/users/:id/profile',
      '/api/users/:id/orders',
      '/api/users/:id/avatar',
      '/api/users/:id/settings',
      '/api/users/:id/notifications',
      '/api/users/search',
      '/api/users/batch',
      '/api/users/login',
      '/api/orders',
      '/api/orders/:id',
      '/api/products',
      '/api/products/:id',
      '/api/payments',
      '/api/cart',
      '/api/reviews',
      '/api/analytics',
      '/api/reports',
      '/api/admin',
    ];

    // 150개의 로그 동적 생성
    const logs = [];
    const logCount = 150;

    for (let i = 0; i < logCount; i++) {
      const randomTime = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime()),
      );
      const messages = logMessages[level as keyof typeof logMessages] || logMessages.error;
      const types = errorTypes[level as keyof typeof errorTypes] || errorTypes.error;

      logs.push({
        log_id: `log_${Date.now()}_${i.toString().padStart(5, '0')}`,
        timestamp: randomTime.toISOString(),
        level: level,
        service: 'user-service',
        message: messages[i % messages.length],
        trace_id: `trace_${Math.random().toString(36).substring(7)}`,
        span_id: `span_${Math.random().toString(36).substring(7)}`,
        attributes: {
          'error.type': types[i % types.length],
          'request.path': requestPaths[i % requestPaths.length],
          'user.id': Math.floor(Math.random() * 10000),
          'request.duration_ms': Math.floor(Math.random() * 1000),
        },
      });
    }

    // 시간 역순으로 정렬 (최신 로그가 먼저)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return HttpResponse.json({
      logs,
      total: logs.length,
      page: 1,
      limit: 150,
      filtered_level: level,
    });
  }),
];
