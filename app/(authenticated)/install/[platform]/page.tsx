import PlatformInstallClient from '@/components/features/install/PlatformInstallClient';
import { PlatformType } from '@/types/agent-install';

// Vercel Dynamic Rendering 활성화
// 런타임에 동적으로 모든 platform 값을 처리 가능
export const dynamicParams = true;

export default async function Page({ params }: { params: Promise<{ platform: PlatformType }> }) {
  const resolvedParams = await params;
  return <PlatformInstallClient platformKey={resolvedParams.platform} />;
}
