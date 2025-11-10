import { SiGoogleanalytics } from 'react-icons/si';
import { GrHostMaintenance } from 'react-icons/gr';
import { HeaderDropdown } from './HeaderDropdown';
import Logo from '@/components/icons/Logo';

export const AuthenticatedHeader = () => {
  // APM 드롭다운 아이템
  const apmItems = [
    {
      href: '/apm/services',
      label: 'Services',
      ariaLabel: 'Go to Services',
    },
  ];

  // Agent 드롭다운 아이템
  const agentItems = [
    {
      href: '/install',
      label: 'Install Agents',
      ariaLabel: 'Go to Install Agents page',
    },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="flex items-center px-6 py-4">
        <div className="shrink-0">
          <Logo />
        </div>

        {/* 오른쪽 아이콘들: APM, Agent 각각 드롭다운 */}
        <div className="ml-auto flex items-center gap-2">
          <HeaderDropdown
            triggerIcon={<SiGoogleanalytics className="w-6 h-6 text-zinc-700" />}
            triggerLabel="APM menu"
            triggerHref="/apm"
            title="APM"
            items={apmItems}
          />
          <HeaderDropdown
            triggerIcon={<GrHostMaintenance className="w-6 h-6 text-zinc-700" />}
            triggerLabel="Agent menu"
            triggerHref="/install"
            title="Integration"
            items={agentItems}
          />
        </div>
      </div>
    </header>
  );
};
