import type { ReactNode } from 'react';

export default function mainLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-screen p-6">{children}</main>;
}
