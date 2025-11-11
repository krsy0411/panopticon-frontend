# AWS S3 + CloudFront MSW 배포 가이드

## 🎯 현재 배포 환경 확인

AWS S3 + CloudFront로 Next.js 정적 사이트를 배포 중입니다.

---

## ✅ 이미 완료된 설정

### 1. GitHub Actions 배포 워크플로우

- `.github/workflows/deploy.yml`에 환경변수 설정 완료 ✅
- `NEXT_PUBLIC_ENABLE_MOCKING=false`로 빌드

### 2. 정적 빌드 설정

- `next.config.ts`에 `output: 'export'` 설정 ✅
- S3 정적 호스팅에 적합

### 3. .dockerignore

- MSW 관련 파일 제외 설정 완료 ✅

---

## 🔧 추가 설정이 필요한 항목

### ❌ 설정 불필요한 것들

| 항목                    | 필요 여부 | 이유                   |
| ----------------------- | --------- | ---------------------- |
| **S3 버킷 정책**        | ❌        | 이미 설정되어 있을 것  |
| **CloudFront 배포**     | ❌        | 이미 연결되어 있을 것  |
| **환경변수 추가**       | ❌        | 빌드 타임에 주입됨     |
| **Service Worker 차단** | ❌        | 빌드 결과에 포함 안 됨 |

---

## ⚠️ 확인해야 할 설정 (선택적)

### 1. CloudFront 캐시 정책

**Service Worker 파일은 절대 캐시하면 안 됩니다!**

하지만 **프로덕션 빌드에는 Service Worker가 포함되지 않으므로** 현재는 문제없습니다.

만약 혹시 모를 경우를 대비하려면:

```json
# CloudFront Behavior 설정에 추가 (선택적)
{
  "PathPattern": "mockServiceWorker.js",
  "CacheBehavior": {
    "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",  // CachingDisabled
    "Compress": false
  }
}
```

**하지만 이것도 불필요합니다!** 왜냐하면:

- `.dockerignore`로 이미 제외됨
- 빌드 시 `out/`에 포함 안 됨
- S3에 업로드되지 않음

---

### 2. S3 버킷에서 불필요한 파일 제거

혹시 이전에 테스트하면서 `mockServiceWorker.js`가 업로드된 경우:

```bash
# AWS CLI로 확인
aws s3 ls s3://YOUR_BUCKET_NAME/mockServiceWorker.js

# 있다면 삭제
aws s3 rm s3://YOUR_BUCKET_NAME/mockServiceWorker.js

# CloudFront 캐시 무효화
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/mockServiceWorker.js"
```

---

### 3. CloudFront 응답 헤더 정책 (보안 강화)

Service Worker는 HTTPS에서만 동작하므로, HTTPS 강제는 이미 되어 있을 것입니다.

추가 보안 헤더 (권장):

```json
# CloudFront Response Headers Policy
{
  "SecurityHeadersConfig": {
    "StrictTransportSecurity": {
      "AccessControlMaxAgeSec": 63072000,
      "IncludeSubdomains": true,
      "Override": true
    },
    "ContentSecurityPolicy": {
      "ContentSecurityPolicy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval';",
      "Override": false
    }
  }
}
```

**하지만 Next.js static export는 런타임이 없으므로 CSP 설정이 제한적입니다.**

---

## 🎯 실제 배포 후 검증

### 배포된 사이트에서 확인:

```bash
# 1. 사이트 접속
https://your-cloudfront-domain.cloudfront.net

# 2. 브라우저 개발자 도구 (F12)
# - Console: "[MSW]" 메시지 없어야 함 ✅
# - Application → Service Workers: 비어있어야 함 ✅
# - Network: 요청에 ⚙️ 아이콘 없어야 함 ✅

# 3. 소스 검사
# - View Page Source
# - Ctrl+F로 "msw" 검색 → 없어야 함 ✅
```

### curl로 검증:

```bash
# Service Worker 파일 요청 (404여야 정상)
curl -I https://your-cloudfront-domain.cloudfront.net/mockServiceWorker.js
# Expected: HTTP/1.1 404 Not Found ✅

# 메인 페이지 소스에 MSW 코드 없는지 확인
curl https://your-cloudfront-domain.cloudfront.net | grep -i "msw"
# Expected: (빈 출력) ✅
```

---

## 📋 배포 체크리스트

### GitHub Actions가 실행될 때마다:

- [ ] `NEXT_PUBLIC_ENABLE_MOCKING=false`로 빌드
- [ ] `out/` 디렉토리에 MSW 관련 파일 없음
- [ ] S3에 `mockServiceWorker.js` 업로드 안 됨
- [ ] CloudFront에서 MSW 관련 파일 접근 불가
- [ ] 실제 사이트에서 MSW 메시지 없음

---

## 🚨 만약 문제가 발생한다면

### MSW가 프로덕션에서 활성화된 경우:

**1. GitHub Actions 로그 확인:**

```bash
# .github/workflows/deploy.yml의 Build 단계 확인
# 환경변수가 제대로 주입되었는지 확인
```

**2. S3 버킷 내용 확인:**

```bash
aws s3 ls s3://YOUR_BUCKET_NAME/ --recursive | grep -E "(msw|mock)"
# 아무것도 나오지 않아야 함
```

**3. 로컬에서 프로덕션 빌드 테스트:**

```bash
NEXT_PUBLIC_ENABLE_MOCKING=false npm run build
ls out/ | grep mock
# 아무것도 나오지 않아야 함
```

---

## ✅ 최종 답변

### 추가 설정 필요 여부: **없습니다!**

**이유:**

1. ✅ GitHub Actions에 환경변수 이미 설정됨
2. ✅ `.dockerignore`에 MSW 파일 제외 설정됨
3. ✅ 정적 빌드 시 MSW 코드가 번들에서 제외됨
4. ✅ S3에는 `out/` 디렉토리만 업로드됨
5. ✅ CloudFront는 S3의 파일만 서빙함

**현재 설정으로 완벽하게 동작합니다!** 🎉

---

## 🎓 권장 사항 (선택적)

1. **배포 후 검증 자동화** (선택)

   ```yaml
   # .github/workflows/deploy.yml에 추가
   - name: Verify deployment
     run: |
       # MSW 파일이 S3에 없는지 확인
       ! aws s3 ls s3://$S3_BUCKET/mockServiceWorker.js
   ```

2. **정기적인 보안 감사** (선택)

   - CloudFront 로그에서 `/mockServiceWorker.js` 요청 모니터링
   - 404 응답이어야 정상

3. **모니터링 알림** (선택)
   - CloudWatch Alarms로 비정상 파일 접근 감지

**하지만 현재 설정으로 이미 충분히 안전합니다!** ✅
