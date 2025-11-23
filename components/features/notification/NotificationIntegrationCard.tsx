// 알림 채널(Discord / Slack / Teams / Email)

'use client';
import { FaDiscord, FaSlack } from 'react-icons/fa';
import { BsMicrosoftTeams } from 'react-icons/bs';
import { MdEmail } from 'react-icons/md';
import type { IntegrationType } from '@/src/types/notification';

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

const initialNow = Date.now();

const formatRelative = (value?: Date) => {
  if (!value) return '';
  const diff = initialNow - value.getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));

  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  return `${Math.round(hours / 24)}일 전`;
};

export interface NotificationIntegrationCardProps {
  type: IntegrationType;
  isConnected?: boolean;
  connectedSloCount?: number;
  lastTestResult?: 'success' | 'failure' | null;
  lastTestAt?: Date;
  errorMessage?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onConfigure?: () => void;
}

export default function NotificationIntegrationCard({
  type,
  isConnected = false,
  connectedSloCount = 0,
  lastTestResult,
  lastTestAt,
  errorMessage,
  onConnect,
  onDisconnect,
  onConfigure,
}: NotificationIntegrationCardProps) {
  const connected = isConnected;
  const relativeLastTest = formatRelative(lastTestAt);

  const config = integrationConfig[type];

  const handleToggle = () => {
    if (connected) {
      onDisconnect?.();
    } else {
      onConnect?.();
    }
  };

  const handleConfigure = () => onConfigure?.();

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

      {/* 상태 정보 */}
      <div className="w-full text-left text-xs text-gray-700 space-y-1 mb-4">
        <div className="flex items-center justify-between font-semibold">
          <span>{connected ? '연결됨' : '연결 안됨'}</span>
          <span>{connectedSloCount}개 SLO</span>
        </div>

        {/* 테스트 결과 */}
        {lastTestResult && (
          <div
            className={`font-semibold ${
              lastTestResult === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            테스트 메시지: {lastTestResult === 'success' ? '성공' : '실패'} (
            {relativeLastTest || '방금 전'})
          </div>
        )}

        {/* 오류 메시지 */}
        {errorMessage && <div className="text-red-600">연동 오류 · {errorMessage}</div>}
      </div>

      {/* 설정 버튼 */}
      {connected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleConfigure();
          }}
          className="
            w-full px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
            border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400
          "
        >
          설정
        </button>
      )}
    </div>
  );
}
