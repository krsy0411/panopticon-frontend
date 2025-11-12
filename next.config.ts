import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // 외부 이미지를 사용하지 않으므로 remotePatterns 제거 : 로컬 이미지만 사용 (public/ 폴더)

  // CORS 설정 제거:
  // - Next.js API Routes를 사용하지 않음 (app/api/ 폴더 없음)
  // - 클라이언트에서 백엔드 ALB로 직접 요청
  // - CORS는 백엔드 서버(AWS ALB)에서 처리 필요
};

export default nextConfig;
