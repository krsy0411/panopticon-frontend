# MSW 개발/운영 환경 분리 검증 가이드

## ✅ 검증 체크리스트

### 1. 환경변수 확인

#### 개발 환경 (.env.local)

```bash
cat .env.local
# 출력: NEXT_PUBLIC_ENABLE_MOCKING=true
```

#### 프로덕션 환경 (.env.production)

```bash
cat .env.production
# 출력: NEXT_PUBLIC_ENABLE_MOCKING=false
```

✅ **확인 완료**

---

### 2. 개발 모드 테스트

```bash
npm run dev
```

**브라우저에서 확인할 것:**

1. **개발자 도구 콘솔 (F12)** 열기
2. 다음 메시지 확인:
   ```
   [MSW] Service Worker가 활성화되었습니다.
   ```
3. **Application 탭 → Service Workers** 확인

   - `mockServiceWorker.js` 실행 중 ✅

4. **Network 탭** 확인

   - API 요청 옆에 ⚙️ (톱니바퀴) 아이콘 표시
   - 이는 Service Worker가 요청을 가로챘다는 의미

5. **콘솔에서 직접 테스트:**
   ```javascript
   fetch('/api/dependencies')
     .then((r) => r.json())
     .then(console.log);
   // MSW 핸들러의 mock 데이터가 출력됨
   ```

✅ **MSW 정상 동작**

---

### 3. 프로덕션 빌드 테스트

```bash
# 프로덕션 빌드
NEXT_PUBLIC_ENABLE_MOCKING=false npm run build

# 빌드 결과 확인
ls -lh out/
```

**확인할 것:**

1. **빌드 로그에서 에러 없음** ✅
2. **빌드 완료 메시지:**

   ```
   ✓ Generating static pages (7/7)
   ✓ Finalizing page optimization
   ```

3. **번들 크기 확인:**

   ```bash
   # out/ 디렉토리의 JavaScript 파일 크기 확인
   find out -name "*.js" -exec ls -lh {} \;
   ```

   → MSW 관련 코드가 제외되어 크기가 작아야 함

4. **빌드된 파일에서 MSW 코드 검색:**

   ```bash
   # 빌드 결과에 'msw' 문자열이 있는지 확인
   grep -r "msw" out/ --include="*.js" || echo "MSW 코드 없음 ✅"
   ```

   → "MSW 코드 없음" 출력되어야 함

5. **로컬에서 프로덕션 빌드 실행:**

   ```bash
   # 간단한 HTTP 서버로 테스트
   npx serve out
   # 또는
   python3 -m http.server --directory out 8080
   ```

6. **브라우저 확인:**
   - 콘솔에 `[MSW] Service Worker가 활성화되었습니다.` 메시지 **없음** ✅
   - Application → Service Workers에 worker **없음** ✅
   - Network 탭에 ⚙️ 아이콘 **없음** ✅

✅ **프로덕션에서 MSW 비활성화 확인**

---

### 4. MswProvider 코드 검증

```typescript
// src/components/MswProvider.tsx
useEffect(() => {
  // ✅ 방어 1: 프로덕션 환경 체크
  if (process.env.NODE_ENV === 'production') {
    return;  // 여기서 종료
  }

  // ✅ 방어 2: 환경변수 체크
  if (process.env.NEXT_PUBLIC_ENABLE_MOCKING !== 'true') {
    return;  // 여기서 종료
  }

  // ✅ 방어 3: 동적 import (Tree-shaking 대상)
  import('../mocks/browser')
    .then(({ worker }) => { ... })
    .catch((error) => { ... });
}, []);
```

**다층 방어 확인:**

1. NODE_ENV === 'production' → 실행 차단
2. NEXT_PUBLIC_ENABLE_MOCKING !== 'true' → 실행 차단
3. 동적 import → Turbopack/Webpack이 자동으로 Tree-shaking

✅ **3중 안전장치 확인**

---

### 5. GitHub Actions 워크플로우 검증

#### Integration Workflow

```yaml
- name: Build
  env:
    NEXT_PUBLIC_ENABLE_MOCKING: false # ✅ 명시적으로 false
  run: npm run build
```

#### Deploy Workflow

```yaml
- name: Build
  env:
    NEXT_PUBLIC_ENABLE_MOCKING: false # ✅ 명시적으로 false
  run: npm run build
```

✅ **CI/CD 파이프라인에서 MSW 비활성화 확인**

---

### 6. Docker 이미지 검증

```bash
# .dockerignore 확인
cat .dockerignore | grep msw
# 출력:
# src/mocks
# public/mockServiceWorker.js
```

✅ **Docker 이미지에 MSW 파일 제외 확인**

---

## 🎯 최종 검증 요약

| 환경                     | NODE_ENV    | ENABLE_MOCKING | MSW 동작    | 검증 방법                 |
| ------------------------ | ----------- | -------------- | ----------- | ------------------------- |
| **로컬 개발**            | development | true           | ✅ 활성화   | 콘솔에 "[MSW] ..." 메시지 |
| **로컬 개발 (실제 API)** | development | false          | ❌ 비활성화 | MSW 메시지 없음           |
| **프로덕션 빌드**        | production  | false          | ❌ 비활성화 | 번들에 MSW 코드 없음      |
| **CI/CD**                | production  | false          | ❌ 비활성화 | GitHub Actions 환경변수   |
| **배포 (S3)**            | production  | false          | ❌ 비활성화 | 실제 서비스에서 확인      |

---

## 🔍 실전 검증 명령어 모음

### 개발 환경 확인

```bash
# 1. 개발 서버 시작
npm run dev

# 2. 브라우저 콘솔에서
# [MSW] Service Worker가 활성화되었습니다. ← 이 메시지 확인
```

### 프로덕션 빌드 확인

```bash
# 1. 빌드 (환경변수 명시)
NEXT_PUBLIC_ENABLE_MOCKING=false npm run build

# 2. MSW 코드 검색 (없어야 정상)
grep -r "Mock Service Worker" out/ || echo "✅ MSW 코드 제거됨"

# 3. 빌드 결과 실행
npx serve out

# 4. 브라우저에서 localhost:3000 접속
# 콘솔에 MSW 메시지 없어야 함 ✅
```

### CloudFront 배포 확인

```bash
# 실제 배포된 사이트 접속 후:
# 1. F12 개발자 도구 → Console
# 2. "[MSW]" 문자열 검색 → 없어야 함 ✅
# 3. Application → Service Workers → 비어있어야 함 ✅
```

---

## 🚨 문제 발생 시 체크

### MSW가 프로덕션에서 활성화되는 경우:

1. **.env.production 확인**

   ```bash
   cat .env.production
   # NEXT_PUBLIC_ENABLE_MOCKING=false 인지 확인
   ```

2. **GitHub Actions 환경변수 확인**

   - `.github/workflows/deploy.yml`에 `NEXT_PUBLIC_ENABLE_MOCKING: false` 있는지

3. **빌드 시 환경변수 주입 확인**
   ```bash
   # 명시적으로 false 설정
   NEXT_PUBLIC_ENABLE_MOCKING=false npm run build
   ```

### MSW가 개발에서 동작하지 않는 경우:

1. **.env.local 확인**

   ```bash
   cat .env.local
   # NEXT_PUBLIC_ENABLE_MOCKING=true 인지 확인
   ```

2. **Service Worker 파일 존재 확인**

   ```bash
   ls -la public/mockServiceWorker.js
   # 파일이 있어야 함
   ```

3. **재생성 시도**
   ```bash
   npx msw init public/ --save
   ```

---

## ✅ 결론

**현재 설정은 다음을 보장합니다:**

1. ✅ 개발 환경에서만 MSW 활성화
2. ✅ 프로덕션 빌드에서 MSW 코드 제외
3. ✅ CI/CD 파이프라인에서 MSW 비활성화
4. ✅ Docker 이미지에 MSW 파일 미포함
5. ✅ 3중 안전장치로 실수 방지

**검증 완료!** 🎉
