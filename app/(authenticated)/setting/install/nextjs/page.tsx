import FrameworkInstallClient from '@/components/features/install/FrameworkInstallClient';
import { frameworksData } from '../frameworks';

export default function NextjsInstallPage() {
  return <FrameworkInstallClient framework={frameworksData.nextjs} />;
}
