import FrameworkInstallClient from '@/components/features/install/FrameworkInstallClient';
import { frameworksData } from '../frameworks';

export default function PythonInstallPage() {
  return <FrameworkInstallClient framework={frameworksData.python} />;
}
