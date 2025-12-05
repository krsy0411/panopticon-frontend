# Panopticon PRD (Product Requirements Document)

## 1. 제품 개요

### 1.1 제품 비전

Panopticon은 마이크로서비스 아키텍처 환경에서 발생하는 복잡한 서비스 간 통신을 **한눈에 파악**하고, 성능 이슈를 **신속하게 진단**할 수 있는 APM(Application Performance Monitoring) 솔루션입니다.

### 1.2 제품명의 의미

**Panopticon**(판옵티콘)은 모든 방향을 관찰할 수 있는 감시 구조를 의미합니다. 이 이름처럼 Panopticon은 분산 시스템의 모든 서비스를 중앙에서 관찰하고 모니터링합니다.

### 1.3 핵심 가치

- **가시성(Visibility)**: 분산된 서비스 간의 요청 흐름을 시각화
- **신속성(Speed)**: 실시간 메트릭과 로그로 빠른 문제 감지
- **자동화(Automation)**: SLO 기반 알림으로 자동 장애 알림

---

## 2. 타겟 사용자

### 2.1 주요 사용자

| 사용자 유형                        | 사용 목적                     |
| ---------------------------------- | ----------------------------- |
| **DevOps 엔지니어**                | 인프라 모니터링, 장애 대응    |
| **백엔드 개발자**                  | API 성능 분석, 병목 지점 파악 |
| **SRE(Site Reliability Engineer)** | SLO 관리, 서비스 안정성 확보  |
| **테크 리드**                      | 시스템 전체 헬스 체크         |

### 2.2 사용 시나리오

1. **장애 발생 시**: 에러율 급등 알림 수신 → 대시보드에서 문제 서비스 식별 → 트레이스 분석으로 근본 원인 파악
2. **성능 최적화**: 레이턴시 메트릭 분석 → 느린 엔드포인트 식별 → 상세 트레이스로 병목 구간 확인
3. **SLO 관리**: SLO 목표 설정 → 임계치 초과 시 자동 알림 → 대응 후 메트릭 개선 확인

---

## 3. 기능 요구사항

### 3.1 핵심 기능 (Must Have)

#### 3.1.1 대시보드

- [x] 등록된 서비스 목록 표시
- [x] 서비스별 요약 메트릭 (요청 수, 에러율, 평균 레이턴시)
- [ ] 드래그 앤 드롭 위젯 커스터마이징
- [x] 시간 범위 선택 (15분 ~ 7일)

#### 3.1.2 서비스 상세

- [x] 실시간 메트릭 차트 (요청 수, 에러율, 레이턴시)
- [x] 엔드포인트별 성능 테이블
- [x] 에러 로그 실시간 스트리밍
- [x] 차트 클릭 시 해당 시간대 트레이스 조회

#### 3.1.3 트레이스 분석

- [x] Waterfall View: 시간 순서대로 스팬 시각화
- [x] Flame Graph: 호출 스택 시각화
- [x] Map View: 서비스 간 관계 시각화
- [x] Span List: 스팬 상세 정보 테이블

#### 3.1.4 알림 시스템

- [x] SLO(Service Level Objective) 정의
- [x] 임계치 기반 알림 규칙 설정
- [x] 다중 알림 채널 (Slack, Discord, Teams, Email)
- [ ] 알림 이력 조회

### 3.2 부가 기능 (Nice to Have)

- [ ] 다크 모드
- [ ] 대시보드 공유 기능
- [ ] 커스텀 메트릭 정의
- [ ] 알림 에스컬레이션 정책

---

## 4. 비기능 요구사항

### 4.1 성능

| 항목                    | 목표  |
| ----------------------- | ----- |
| 대시보드 초기 로딩      | < 2초 |
| 메트릭 데이터 갱신 주기 | 10초  |
| 실시간 로그 지연        | < 1초 |

### 4.2 호환성

- **브라우저**: Chrome, Safari, Firefox, Edge 최신 버전
- **해상도**: 1280px 이상 권장, 768px 이상 지원

### 4.3 보안

- JWT 기반 인증
- API 요청 시 인증 토큰 필수
- HTTPS 통신

---

## 5. 기술 스택

### 5.1 프론트엔드

| 구분        | 기술                                        |
| ----------- | ------------------------------------------- |
| 프레임워크  | Next.js 16 (App Router)                     |
| 언어        | TypeScript                                  |
| 상태 관리   | Zustand (클라이언트), TanStack Query (서버) |
| 스타일링    | Tailwind CSS 4                              |
| 차트        | ECharts (echarts-for-react)                 |
| 애니메이션  | Framer Motion                               |
| 실시간 통신 | Socket.io Client                            |
| 인증        | jose (JWT)                                  |

### 5.2 개발 환경

| 구분          | 도구                   |
| ------------- | ---------------------- |
| 패키지 매니저 | npm                    |
| 린터          | ESLint                 |
| 포매터        | Prettier               |
| 컨테이너      | Docker, Docker Compose |

---

## 6. 데이터 모델

### 6.1 주요 엔티티

#### Service

```typescript
interface Service {
  name: string;
  totalRequests: number;
  errorRate: number;
  avgLatency: number;
  endpoints: Endpoint[];
}
```

#### Endpoint

```typescript
interface Endpoint {
  method: string;
  path: string;
  requests: number;
  errorRate: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
}
```

#### Trace

```typescript
interface Trace {
  traceId: string;
  spans: Span[];
  duration: number;
  startTime: number;
}
```

#### SLO

```typescript
interface SLO {
  id: string;
  serviceName: string;
  metricType: 'error_rate' | 'latency' | 'throughput';
  threshold: number;
  webhooks: Webhook[];
}
```

---

## 7. API 연동

### 7.1 주요 API 엔드포인트

| 메서드 | 경로                             | 설명                 |
| ------ | -------------------------------- | -------------------- |
| GET    | `/api/services`                  | 서비스 목록 조회     |
| GET    | `/api/services/{name}/metrics`   | 서비스 메트릭 조회   |
| GET    | `/api/services/{name}/endpoints` | 엔드포인트 목록 조회 |
| GET    | `/api/traces/{traceId}`          | 트레이스 상세 조회   |
| GET    | `/api/slo`                       | SLO 목록 조회        |
| POST   | `/api/slo`                       | SLO 생성             |
| POST   | `/api/webhooks`                  | 웹훅 설정            |

### 7.2 WebSocket 이벤트

| 이벤트      | 설명                  |
| ----------- | --------------------- |
| `error-log` | 실시간 에러 로그 수신 |

---

## 8. 릴리즈 계획

### Phase 1: MVP

- 서비스 목록 및 기본 메트릭 대시보드
- 서비스 상세 페이지 (메트릭 차트)
- 기본 트레이스 분석 (Waterfall)

### Phase 2: 고급 분석

- Flame Graph, Map View 추가
- 엔드포인트별 상세 분석
- 실시간 에러 로그

### Phase 3: 알림 시스템

- SLO 설정 및 관리
- 다중 알림 채널 연동
- 알림 이력 및 대시보드

---

## 9. 성공 지표

| 지표                       | 목표        |
| -------------------------- | ----------- |
| 평균 장애 감지 시간 (MTTD) | < 1분       |
| 대시보드 일일 활성 사용자  | 팀 전체     |
| SLO 알림 정확도            | > 95%       |
| 사용자 만족도              | > 4.0 / 5.0 |
