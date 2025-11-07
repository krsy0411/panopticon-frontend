import type { ReactNode } from 'react';

export default function mainLayout({ children }: { children: ReactNode }) {
  return <main className="w-screen h-screen">{children}</main>;
}