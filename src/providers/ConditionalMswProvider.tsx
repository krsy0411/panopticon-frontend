'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// MSW는 개발 환경에서만 동적으로 import
// production 빌드 시 mocks 폴더가 없을 수 있으므로 에러 처리
const MswProvider =
  process.env.NEXT_PUBLIC_ENABLE_MOCKING === 'true'
    ? dynamic(() => import('@/mocks/MswProvider').catch(() => ({ default: ({ children }: { children: ReactNode }) => children })), {
        ssr: false,
        loading: () => null,
      })
    : ({ children }: { children: ReactNode }) => children;

export default MswProvider;
