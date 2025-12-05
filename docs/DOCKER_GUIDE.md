# 🐳 Docker Compose 개발환경 가이드

## 개발환경 시작

### 간단한 시작

```bash
docker compose up
```

- 첫 실행 시: Dockerfile을 빌드하고 컨테이너 시작
- 이후 실행 시: 기존 이미지 재사용 (빠름)

### 백그라운드에서 실행

```bash
docker compose up -d
```

### 컨테이너 종료

```bash
docker compose down
```

## 🔄 핫 리로드 (Hot Reload) 동작 원리

### 왜 Docker Compose를 사용하나?

#### 1. **볼륨 마운트 자동화**

- `docker-compose.yml`에 볼륨 설정이 미리 정의되어 있음
- 매번 `-v` 옵션을 입력할 필요 없음
- 실수로 인한 마운트 오류 방지

#### 2. **node_modules 격리**

- 호스트와 컨테이너의 `node_modules` 분리
- 네이티브 바이너리 모듈(lightningcss 등) 호환성 보장
- M1/M2 맥과 Linux 환경에서 동일한 의존성 사용

#### 3. **개발 효율성**

- 하나의 명령어로 전체 환경 관리
- 환경 설정을 코드로 관리 (일관성 유지)
- 팀원들 간 개발환경 동일성 보장

## 📊 작동 방식

```
호스트(MacOS/Linux)         Docker 컨테이너
┌─────────────────────┐    ┌──────────────────┐
│ 로컬 소스코드           │──→│ 마운트된 /app       │
│ (실시간 변경)          │    │                  │
└─────────────────────┘    │ Next.js Dev      │
                           │ Server (핫 리로드) │
                           └──────────────────┘
     파일 변경 감지           즉시 리빌드/새로고침
```

## 📁 docker-compose.yml 설정 상세

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: . # Dockerfile 위치
      dockerfile: Dockerfile
    container_name: panopticon-frontend-dev
    ports:
      - '3000:3000' # 호스트:컨테이너 포트 매핑
    volumes:
      - ./:/app # 소스코드 마운트 (핫 리로드)
      - /app/node_modules # node_modules는 컨테이너 것만 사용
    environment:
      - NODE_ENV=development # 개발환경 설정
    restart: unless-stopped # 컨테이너 오류 시 자동 재시작
```

### 각 설정의 역할

| 설정                   | 역할                       | 이유                                    |
| ---------------------- | -------------------------- | --------------------------------------- |
| `./:/app`              | 소스코드 전체 마운트       | 파일 변경 감지 → 즉시 반영              |
| `/app/node_modules`    | 호스트 node_modules 제외   | 네이티브 모듈 호환성 (ARM64 vs x86 등)  |
| `3000:3000`            | Next.js dev 서버 포트 노출 | 브라우저에서 http://localhost:3000 접근 |
| `NODE_ENV=development` | 개발 모드                  | Next.js 고속 리빌드, 소스맵 포함        |

## 🚀 실제 개발 워크플로우

### 1단계: 개발환경 시작

```bash
docker compose up
```

### 2단계: 브라우저 열기

```
http://localhost:3000
```

### 3단계: 코드 수정

```tsx
// app/(authenticated)/main/page.tsx 수정
export default function Page() {
  return <h1>변경됨!</h1>;
}
```

### 4단계: 자동 반영

- ✅ 로컬에서 파일 저장
- ✅ 컨테이너 내부의 `/app`에 즉시 반영
- ✅ Next.js Dev Server가 감지
- ✅ 브라우저 자동 새로고침 (핫 리로드)

### 5단계: 개발 완료 후 종료

```bash
docker compose down
```

## ⚠️ 주의사항

### `docker compose up` 할 때

**첫 실행:**

```
npm ci (의존성 설치)
↓
npm run dev (개발 서버 시작)
```

**이후 실행:**

```
기존 컨테이너/이미지 재사용 (빠름)
```

### 이미지 재빌드 필요한 경우

```bash
# Dockerfile 수정, 의존성 추가 등
docker compose up --build
```

### 컨테이너 완전 제거

```bash
# 이미지, 볼륨까지 모두 제거
docker compose down -v
```

## 🔧 문제 해결

### ❌ lightningcss 모듈 오류

**에러 메시지:**

```
Error: Cannot find module '../lightningcss.linux-arm64-gnu.node'
```

**원인:**
호스트의 `node_modules`가 컨테이너 내부로 마운트되어, 아키텍처 호환성 문제 발생

**해결책:**

```bash
# 컨테이너 완전 재시작 (docker-compose.yml의 /app/node_modules 설정 재적용)
docker compose down
docker compose up --build
```

### ❌ 포트 3000이 이미 사용 중

**해결책 1: 환경변수로 포트 변경**

```bash
PORT=3001 docker compose up
```

**해결책 2: docker-compose.yml에서 포트 직접 변경**

```yaml
ports:
  - '3001:3000' # 호스트 3001 → 컨테이너 3000
```

### ❌ 변경사항이 반영되지 않음

**해결책:**

```bash
# 캐시 초기화 후 재시작
docker compose down -v
docker compose up --build
```

## 📚 추가 참고

- **Next.js 공식 문서**: https://nextjs.org/docs
- **Docker 공식 문서**: https://docs.docker.com/
- **API 서버**: NestJS (별도 저장소, localhost:3001로 운영)

## 💡 팁

### 여러 터미널에서 동시 작업

```bash
# 터미널 1: Docker 컨테이너 실행
docker compose up

# 터미널 2: 다른 작업 (git, npm 명령어 등)
git status
npm run lint
```

### 컨테이너 내부에 접속

```bash
# 컨테이너 shell 접근
docker compose exec frontend bash

# npm 명령어 직접 실행
docker compose exec frontend npm run build
```

### 로그 확인

```bash
# 실시간 로그 보기
docker compose logs -f

# 컨테이너 로그만 보기
docker compose logs frontend
```
