import { Suspense } from 'react';
import InstallPageClient from './InstallPageClient';

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <InstallPageClient />
    </Suspense>
  );
}
