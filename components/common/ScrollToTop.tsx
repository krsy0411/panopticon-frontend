'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * 페이지 이동 시 스크롤을 맨 위로 자동으로 이동시키는 컴포넌트
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // 페이지 경로가 변경될 때마다 스크롤을 맨 위로 이동
    window.scrollTo(0, 0);

    // main 요소가 있으면 main도 스크롤 초기화
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
