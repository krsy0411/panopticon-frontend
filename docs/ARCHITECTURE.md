# Panopticon Frontend Architecture

## 1. 시스템 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────────┐
│                        Panopticon Frontend                      │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐    │
│  │   Next.js     │  │   Zustand     │  │  TanStack Query   │    │
│  │  App Router   │  │    Store      │  │  (Server State)   │    │
│  └───────┬───────┘  └───────┬───────┘  └─────────┬─────────┘    │
│          │                  │                    │              │
│          └──────────────────┼────────────────────┘              │
│                             │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐    │
│  │                    API Layer                            │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │    │
│  │  │  REST API   │  │  WebSocket  │  │   Auth (JWT)    │  │    │
│  │  │   Client    │  │   Client    │  │     Handler     │  │    │
│  │  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │    │
│  └─────────┼────────────────┼──────────────────┼───────────┘    │
└────────────┼────────────────┼──────────────────┼────────────────┘
             │                │                  │
             ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend Services                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   APM API    │  │  WebSocket   │  │    Auth Service      │   │
│  │   Server     │  │   Server     │  │                      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 2. 디렉토리 구조

| 폴더             | 역할                                |
| ---------------- | ----------------------------------- |
| `app/`           | Next.js App Router 페이지 및 라우팅 |
| `components/`    | React 컴포넌트 (분석, 기능, UI)     |
| `src/api/`       | API 클라이언트 함수                 |
| `src/hooks/`     | 커스텀 React 훅                     |
| `src/store/`     | Zustand 상태 관리 스토어            |
| `src/providers/` | React Context Providers             |
| `src/utils/`     | 유틸리티 함수                       |
| `types/`         | TypeScript 타입 정의                |
| `public/`        | 정적 파일 (이미지, 아이콘 등)       |
| `docs/`          | 프로젝트 문서                       |

## 3. 핵심 설계 패턴

### 3.1 라우팅 구조 (App Router)

Next.js 16의 App Router를 활용하여 파일 기반 라우팅을 구현합니다.

```
app/
├── (authenticated)/          # Route Group - URL에 영향 없음
│   ├── layout.tsx            # 인증된 페이지 공통 레이아웃
│   ├── page.tsx              # /
│   └── services/
│       ├── page.tsx          # /services
│       ├── install/
│       │   └── page.tsx      # /services/install
│       └── [serviceName]/
│           └── page.tsx      # /services/{serviceName}
└── auth/
    └── page.tsx              # /auth
```

**Route Group `(authenticated)`의 역할:**

- 인증이 필요한 페이지들을 그룹화
- 공통 레이아웃 (사이드바, 헤더) 적용
- 인증 미들웨어 적용

### 3.2 상태 관리 전략

```
┌─────────────────────────────────────────────────────────────┐
│                        State Management                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │    Zustand Store    │    │      TanStack Query         │ │
│  │   (Client State)    │    │     (Server State)          │ │
│  ├─────────────────────┤    ├─────────────────────────────┤ │
│  │ • Time Range        │    │ • Services List             │ │
│  │ • UI State          │    │ • Metrics Data              │ │
│  │ • User Preferences  │    │ • Traces                    │ │
│  │ • Panel Open/Close  │    │ • SLO Configurations        │ │
│  └─────────────────────┘    │ • Webhooks                  │ │
│                             │                             │ │
│                             │ Features:                   │ │
│                             │ • Auto Caching              │ │
│                             │ • Background Refetch        │ │
│                             │ • Stale-While-Revalidate    │ │
│                             └─────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         React Context Providers                        │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ • QueryProvider: TanStack Query 설정                    │ │
│  │ • AlarmProvider: WebSocket 연결 및 에러 알림 상태           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Zustand** (`src/store/`): Provider 없이 사용 가능한 전역 상태 관리

- UI 상태, 사용자 설정 등 클라이언트 전용 상태
- 예: `timeRangeStore` - 시간 범위 선택 상태

**TanStack Query** (`src/providers/QueryProvider.tsx`): 서버 상태 관리

- API 데이터, 캐싱, 자동 갱신이 필요한 서버 상태
- Provider로 `QueryClient` 인스턴스 제공 (라이브러리 요구사항)

**React Context** (`src/providers/`): React의 기본 Context API

- 앱 최상위에서 초기화가 필요한 기능 (WebSocket 연결 등)
- Provider로 컴포넌트 트리에 제공
- 예: `AlarmProvider` - 에러 로그 WebSocket 연결 및 알림 상태 관리

### 3.3 컴포넌트 계층 구조

```
┌─────────────────────────────────────────────────────────────┐
│                      Component Hierarchy                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Pages (app/)                                               │
│  └── Feature Components (components/features/)              │
│      └── UI Components (components/ui/)                     │
│          └── Base Elements (HTML + Tailwind)                │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Page: services/[serviceName]/page.tsx                  │ │
│  │  │                                                     │ │
│  │  ├── OverviewCharts (Feature)                          │ │
│  │  │    ├── StateHandler (UI)                            │ │
│  │  │    └── ReactECharts (Library)                       │ │
│  │  │                                                     │ │
│  │  ├── EndpointTable (Feature)                           │ │
│  │  │    └── Table (UI)                                   │ │
│  │  │                                                     │ │
│  │  └── TraceAnalysisPullUpPanel (Feature)                │ │
│  │       ├── PullUpPanelLayout (UI)                       │ │
│  │       └── TraceAnalysis (Feature)                      │ │
│  │            ├── WaterfallView (Feature)                 │ │
│  │            ├── FlameGraphView (Feature)                │ │
│  │            └── MapView (Feature)                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 4. 데이터 흐름

### 4.1 메트릭 데이터 흐름

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User    │────▶│  TimeRange   │────▶│  API Call    │────▶│   Backend    │
│  Action  │     │  Store       │     │  (Query)     │     │   Server     │
└──────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                  │
┌──────────┐     ┌──────────────┐     ┌──────────────┐            │
│  Chart   │◀────│  Chart       │◀────│  Query       │◀───────────┘
│  Render  │     │  Options     │     │  Cache       │
└──────────┘     └──────────────┘     └──────────────┘
```

### 4.2 실시간 로그 데이터 흐름

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Backend    │────▶│  WebSocket   │────▶│   Custom     │
│   Server     │     │   Client     │     │   Hook       │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
┌──────────────┐     ┌──────────────┐            │
│   Log List   │◀────│   Component  │◀───────────┘
│   Render     │     │   State      │
└──────────────┘     └──────────────┘
```

## 5. API 계층 설계

### 5.1 API 클라이언트 구조

```typescript
// src/api/apm.ts
export const apmApi = {
  // 서비스 목록
  getServices: async () => fetch('/api/services'),

  // 서비스 메트릭
  getServiceMetrics: async (name: string, timeRange: string) =>
    fetch(`/api/services/${name}/metrics?range=${timeRange}`),

  // 엔드포인트 목록
  getEndpoints: async (name: string) => fetch(`/api/services/${name}/endpoints`),

  // 트레이스 상세
  getTrace: async (traceId: string) => fetch(`/api/traces/${traceId}`),
};
```

### 5.2 TanStack Query 패턴

```typescript
// 서비스 메트릭 쿼리
const useServiceMetrics = (serviceName: string) => {
  const { timeRange } = useTimeRangeStore();

  return useQuery({
    queryKey: ['metrics', serviceName, timeRange],
    queryFn: () => apmApi.getServiceMetrics(serviceName, timeRange),
    refetchInterval: 10000, // 10초마다 자동 갱신
    staleTime: 5000, // 5초간 캐시 유효
  });
};
```

## 6. UI 컴포넌트 설계

### 6.1 StateHandler 패턴

모든 데이터 의존 컴포넌트에서 일관된 로딩/에러/빈 상태 처리:

```typescript
<StateHandler
  isLoading={isLoading}
  isError={isError}
  isEmpty={isEmpty}
  type="chart"
  height={300}
  loadingMessage="메트릭을 불러오는 중..."
  emptyMessage="데이터가 없습니다"
>
  <ActualContent />
</StateHandler>
```

### 6.2 패널 레이아웃 시스템

```
┌─────────────────────────────────────────────────────────────┐
│                      Panel Types                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SlideOverLayout          PullUpPanelLayout                 │
│  ┌─────────────────┐     ┌─────────────────────────────────┐│
│  │ Main    │ Side  │     │         Main Content            ││
│  │ Content │ Panel │     ├─────────────────────────────────┤│
│  │         │       │     │       Pull-Up Panel             ││
│  │         │◀─────▶│     │           ▲                     ││
│  │         │       │     │           │                     ││
│  └─────────────────┘     └─────────────────────────────────┘│
│                                                             │
│  Usage:                  Usage:                             │
│  • Detail views          • Trace analysis                   │
│  • Configuration         • Extended information             │
│  • Side information      • Action panels                    │
└─────────────────────────────────────────────────────────────┘
```

## 7. 인증 흐름

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  User    │────▶│  Auth Page   │────▶│  Backend     │
│  Login   │     │  (OAuth)     │     │  Auth        │
└──────────┘     └──────────────┘     └──────┬───────┘
                                             │
                                             ▼
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Access  │◀────│  JWT Token   │◀────│  Token       │
│  Granted │     │  Storage     │     │  Response    │
└──────────┘     └──────────────┘     └──────────────┘
                       │
                       ▼
               ┌──────────────┐
               │  useAuth     │
               │  Hook        │
               │  (Validate)  │
               └──────────────┘
```

## 8. 성능 최적화 전략

### 8.1 코드 스플리팅

- `next/dynamic`을 사용한 차트 라이브러리 동적 로딩
- 라우트 기반 자동 코드 스플리팅 (App Router)

### 8.2 데이터 캐싱

- TanStack Query의 `staleTime`과 `cacheTime` 활용
- 시간 범위 변경 시에만 새 데이터 요청

### 8.3 렌더링 최적화

- `useMemo`로 차트 옵션 메모이제이션
- `React.memo`로 불필요한 리렌더링 방지

## 9. 테스트 전략

| 레벨        | 대상              | 도구                        |
| ----------- | ----------------- | --------------------------- |
| Unit        | 유틸리티 함수, 훅 | Jest, React Testing Library |
| Integration | 컴포넌트 통합     | React Testing Library       |
| E2E         | 사용자 시나리오   | Playwright                  |

## 10. 배포 아키텍처

### 10.1 개발 환경

**Docker Compose**를 사용하여 로컬 개발 환경을 구성합니다.

```bash
docker compose up
```

- 볼륨 마운트를 통한 핫 리로드 지원
- 컨테이너 내부의 `node_modules`로 네이티브 모듈 호환성 보장
- 자세한 내용은 [Docker Guide](./DOCKER_GUIDE.md) 참조

### 10.2 프로덕션 배포

**AWS Amplify**를 통해 GitHub 저장소와 연결하여 자동 배포를 구성했습니다.

```
┌─────────────────────────────────────────────────────────────────┐
│                      배포 파이프라인                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  GitHub Repository                                              │
│       │                                                         │
│       ▼                                                         │
│  AWS Amplify (CI/CD)                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ • GitHub push 감지                                          │ │
│  │ • Next.js 빌드 (SSR 지원)                                    │ │
│  │ • 자동 배포                                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│       │                                                         │
│       ▼                                                         │
│  CloudFront (CDN)                                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ • 전역 엣지 캐싱                                              │ │
│  │ • HTTPS 자동 적용                                            │ │
│  │ • 빠른 콘텐츠 전송                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│       │                                                         │
│       ▼                                                         │
│  Route53 (DNS)                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ • jungle-panopticon.cloud 도메인 관리                         │ │
│  │ • DNS 레코드 설정                                             │ │
│  │ • CloudFront와 연결                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│       │                                                         │
│       ▼                                                         │
│  https://jungle-panopticon.cloud                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 10.3 배포 프로세스

1. **코드 푸시**: GitHub 저장소에 코드 변경사항 푸시
2. **자동 빌드**: Amplify가 변경사항 감지 후 Next.js 프로덕션 빌드 실행
3. **SSR 지원**: Next.js App Router의 Server-Side Rendering 기능 활용
4. **CDN 배포**: CloudFront를 통해 전역 엣지 서버에 배포
5. **DNS 라우팅**: Route53을 통해 도메인을 CloudFront와 연결

### 10.4 인프라 구성

| 서비스         | 역할                                  |
| -------------- | ------------------------------------- |
| **Amplify**    | GitHub 연동, 자동 빌드/배포, SSR 지원 |
| **CloudFront** | 전역 CDN, HTTPS, 캐싱 최적화          |
| **Route53**    | 도메인 관리, DNS 설정                 |
| **도메인**     | jungle-panopticon.cloud               |
