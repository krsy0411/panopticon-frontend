import FrameworkInstallClient from '@/components/features/install/FrameworkInstallClient';
import { frameworksData } from '../frameworks';

export default function NodejsInstallPage() {
  return <FrameworkInstallClient framework={frameworksData.nodejs} />;
}
