import { AuthenticatedHeader } from '@/components/common/authenticated/Header';
import type { ReactNode } from 'react';

export default function mainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthenticatedHeader />
      <main className="w-screen h-screen">{children}</main>
    </>
  );
}
