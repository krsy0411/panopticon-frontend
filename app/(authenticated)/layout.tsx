import { AuthenticatedHeader } from '@/components/common/authenticated/Header';
import { AlarmProvider } from '@/src/providers/AlarmProvider';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import type { ReactNode } from 'react';

export default function mainLayout({ children }: { children: ReactNode }) {
  return (
    <AlarmProvider>
      <ScrollToTop />
      <div className="h-screen flex flex-col">
        <AuthenticatedHeader />
        <main className="flex-1 overflow-y-auto w-full">{children}</main>
      </div>
    </AlarmProvider>
  );
}
