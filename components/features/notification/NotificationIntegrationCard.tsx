// 알림 채널(Discord / Slack / Teams / Email)

'use client';
import { FaDiscord, FaSlack } from 'react-icons/fa';
import { BsMicrosoftTeams } from 'react-icons/bs';
import { MdEmail } from 'react-icons/md';
import type { IntegrationStatus } from '@/src/types/notification';

/* -------------------------------------------------------
   채널별 UI 스타일 config
-------------------------------------------------------- */
const integrationConfig = {
  discord: {
    name: 'Discord',
    description: '디스코드 웹훅으로 알림을 받아보세요',
    icon: <FaDiscord className="w-6 h-6" />,
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    hoverBorderColor: 'hover:border-indigo-400',
    iconColor: 'text-indigo-600',
  },
  slack: {
    name: 'Slack',
    description: '슬랙 채널에서 팀과 함께 알림을 공유하세요',
    icon: <FaSlack className="w-6 h-6" />,
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    hoverBorderColor: 'hover:border-pink-400',
    iconColor: 'text-pink-600',
  },
  teams: {
    name: 'Microsoft Teams',
    description: 'Teams 채널에서 조직과 알림을 공유하세요',
    icon: <BsMicrosoftTeams className="w-6 h-6" />,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverBorderColor: 'hover:border-purple-400',
    iconColor: 'text-purple-600',
  },
  email: {
    name: 'Email',
    description: '이메일로 알림을 받아보세요(SMTP)',
    icon: <MdEmail className="w-6 h-6" />,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverBorderColor: 'hover:border-green-400',
    iconColor: 'text-green-600',
  },
};

export interface NotificationIntegrationCardProps
  extends Omit<IntegrationStatus, 'connectedSloCount'> {
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export default function NotificationIntegrationCard({
  type,
  isConnected = false,
  lastTestResult,
  lastTestAt,
  onConnect,
  onDisconnect,
}: NotificationIntegrationCardProps) {
  const connected = isConnected;

  const config = integrationConfig[type];

  const handleToggle = () => {
    if (connected) {
      onDisconnect?.();
    } else {
      onConnect?.();
    }
  };

  return (
    <div
      onClick={handleToggle}
      className={`
        group relative flex flex-col items-center text-center cursor-pointer
        rounded-xl border bg-white p-5 shadow-sm transition-all duration-300
        ${config.borderColor} ${config.hoverBorderColor}
        hover:shadow-lg hover:scale-[1.015]
      `}
    >
      {/* 연결 시 우측 상단 초록 점 */}
      {connected && (
        <div className="absolute top-2 right-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative h-2 w-2 rounded-full bg-green-500"></span>
          </span>
        </div>
      )}

      {/* 아이콘 */}
      <div
        className={`
          flex items-center justify-center w-14 h-14 rounded-xl
          ${config.bgColor} ${config.iconColor}
          transition-transform duration-300 group-hover:scale-110 shadow-inner
        `}
      >
        {config.icon}
      </div>

      {/* 제목 */}
      <h3 className="mt-3 text-base font-bold text-gray-900">{config.name}</h3>

      {/* 설명 */}
      <p className="text-xs text-gray-500 mt-1 mb-3">{config.description}</p>

      {/* 테스트 결과 */}
      {connected && lastTestResult !== null && lastTestResult !== undefined && (
        <div className="w-full mt-2 pt-2 border-t border-gray-200">
          {lastTestResult === 'success' ? (
            <div className="flex items-center justify-center gap-1 text-xs text-green-700">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
              테스트 성공
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1 text-xs text-red-700">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span>
              테스트 실패
            </div>
          )}
          {lastTestAt && (
            <p className="text-xs text-gray-400 mt-1">
              {typeof lastTestAt === 'string'
                ? new Date(lastTestAt).toLocaleDateString('ko-KR')
                : lastTestAt.toLocaleDateString('ko-KR')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
