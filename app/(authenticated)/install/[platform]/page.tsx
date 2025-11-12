import PlatformInstallClient from '@/components/features/install/PlatformInstallClient';
import { platformsData } from '../platforms';
import { PlatformType } from '@/types/agent-install';

export function generateStaticParams() {
  return Object.keys(platformsData).map((platform) => ({ platform }));
}

export default async function Page({ params }: { params: Promise<{ platform: PlatformType }> }) {
  const resolvedParams = await params;
  return <PlatformInstallClient platformKey={resolvedParams.platform} />;
}
