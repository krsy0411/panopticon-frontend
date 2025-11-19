'use client';

import { FiSettings, FiLayers } from 'react-icons/fi';
import { HeaderDropdown } from './HeaderDropdown';
import { UserProfile } from './UserProfile';
import { Alarm } from './Alarm';
import Logo from '@/components/icons/Logo';

export const AuthenticatedHeader = () => {
  // Setting 드롭다운 아이템
  const settingItems = [
    {
      href: '/services/notification',
      label: '알림 설정',
      ariaLabel: '알림 설정 페이지로 이동',
    },
    {
      href: '/services/install',
      label: '에이전트 설치',
      ariaLabel: '에이전트 설치 페이지로 이동',
    },
  ];

  // APM 드롭다운 아이템
  const apmItems = [
    {
      href: '/services',
      label: '서비스 목록',
      ariaLabel: '이 앱의 서비스 목록으로 이동',
    },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white shadow-md font-sans">
      <div className="flex items-center px-6 py-4">
        <div className="shrink-0">
          <Logo />
        </div>

        {/* 오른쪽 아이콘들: Setting 드롭다운 */}
        <div className="ml-auto flex items-center gap-6">
          <div className="flex items-center gap-5">
            <HeaderDropdown
              triggerIcon={<FiLayers className="w-6 h-6 text-zinc-700" />}
              triggerLabel="APM menu"
              triggerHref="/services"
              title="APM"
              items={apmItems}
            />
            <HeaderDropdown
              triggerIcon={<FiSettings className="w-6 h-6 text-zinc-700" />}
              triggerLabel="Setting menu"
              triggerHref="/services/notification"
              title="Setting"
              items={settingItems}
            />
          </div>

          {/* 구분선 */}
          <div className="h-6 w-px bg-zinc-300" />

          {/* 알림, 마이페이지 */}
          <div className="flex items-center gap-5">
            <Alarm />
            <UserProfile />
          </div>
        </div>
      </div>
    </header>
  );
};
