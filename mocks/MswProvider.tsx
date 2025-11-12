'use client';

import { useEffect } from 'react';

/**
 * MSW Provider
 * 개발 환경에서만 MSW(Mock Service Worker)를 활성화합니다.
 * 환경변수 NEXT_PUBLIC_ENABLE_MOCKING이 'true'일 때만 동작합니다.
 */
export default function MswProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 운영 환경에서는 절대 MSW를 활성화하지 않습니다
    // NODE_ENV는 Next.js가 자동으로 설정 (dev: development, build/start: production)
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    // 환경변수로 모킹 활성화 여부 제어
    if (process.env.NEXT_PUBLIC_ENABLE_MOCKING !== 'true') {
      return;
    }

    // 동적 import로 개발 환경에서만 MSW 로드
    import('./browser')
      .then(({ worker }) => {
        worker.start({
          onUnhandledRequest: 'bypass', // 핸들러가 없는 요청은 실제 API로 전달
          quiet: false, // 콘솔에 모킹 정보 출력
        });
        console.log('[MSW] Service Worker가 활성화되었습니다.');
      })
      .catch((error) => {
        console.error('[MSW] Service Worker 초기화 실패:', error);
      });
  }, []);

  // MSW 초기화와 무관하게 바로 렌더링
  // Service Worker는 백그라운드에서 비동기로 초기화됨
  return <>{children}</>;
}
