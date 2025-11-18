'use client';

import { useState, useEffect } from 'react';
import { FaDiscord, FaSlack, FaGithub, FaTrello } from 'react-icons/fa';
import { SiJira } from 'react-icons/si';
import { BsMicrosoftTeams } from 'react-icons/bs';
import { MdEmail } from 'react-icons/md';

export type IntegrationType =
  | 'discord'
  | 'slack'
  | 'jira'
  | 'github'
  | 'teams'
  | 'trello'
  | 'email';

export interface NotificationIntegrationCardProps {
  type: IntegrationType;
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onConfigure?: () => void;
}

const integrationConfig = {
  discord: {
    name: 'Discord',
    description: '디스코드 웹훅으로 실시간 알림을 받아보세요',
    icon: <FaDiscord className="w-6 h-6" />,
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    hoverBorderColor: 'hover:border-indigo-400',
    buttonColor: 'bg-indigo-600 hover:bg-indigo-700',
    iconColor: 'text-indigo-600',
  },
  slack: {
    name: 'Slack',
    description: '슬랙 채널에서 팀과 함께 알림을 공유하세요',
    icon: <FaSlack className="w-6 h-6" />,
    color: 'from-pink-500 to-red-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    hoverBorderColor: 'hover:border-pink-400',
    buttonColor: 'bg-pink-600 hover:bg-pink-700',
    iconColor: 'text-pink-600',
  },
  jira: {
    name: 'Jira',
    description: '이슈 발생 시 자동으로 지라 티켓을 생성하세요',
    icon: <SiJira className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverBorderColor: 'hover:border-blue-400',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    iconColor: 'text-blue-600',
  },
  github: {
    name: 'GitHub',
    description: 'GitHub 이슈 및 PR로 알림을 관리하세요',
    icon: <FaGithub className="w-6 h-6" />,
    color: 'from-gray-700 to-gray-900',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    hoverBorderColor: 'hover:border-gray-400',
    buttonColor: 'bg-gray-800 hover:bg-gray-900',
    iconColor: 'text-gray-800',
  },
  teams: {
    name: 'Microsoft Teams',
    description: 'Teams 채널로 팀 전체에 알림을 공유하세요',
    icon: <BsMicrosoftTeams className="w-6 h-6" />,
    color: 'from-purple-500 to-blue-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverBorderColor: 'hover:border-purple-400',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
    iconColor: 'text-purple-600',
  },
  trello: {
    name: 'Trello',
    description: 'Trello 카드로 알림을 작업으로 전환하세요',
    icon: <FaTrello className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverBorderColor: 'hover:border-blue-400',
    buttonColor: 'bg-blue-500 hover:bg-blue-600',
    iconColor: 'text-blue-500',
  },
  email: {
    name: 'Email',
    description: '이메일로 알림을 받아보세요 (SMTP)',
    icon: <MdEmail className="w-6 h-6" />,
    color: 'from-green-500 to-teal-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverBorderColor: 'hover:border-green-400',
    buttonColor: 'bg-green-600 hover:bg-green-700',
    iconColor: 'text-green-600',
  },
};

export default function NotificationIntegrationCard({
  type,
  isConnected = false,
  onConnect,
  onDisconnect,
  onConfigure,
}: NotificationIntegrationCardProps) {
  const [connected, setConnected] = useState(isConnected);
  useEffect(() => {
    setConnected(isConnected);
  }, [isConnected]);
  const config = integrationConfig[type];

  const handleToggle = () => {
    if (connected) {
      onDisconnect?.();
      setConnected(false);
    } else {
      // Only trigger parent connect flow (open modal). Do NOT set local connected=true here.
      onConnect?.();
    }
  };

  const handleConfigure = () => {
    onConfigure?.();
  };

  return (
    <div
      className={`relative bg-white rounded-lg border ${config.borderColor} ${config.hoverBorderColor} p-4 transition-all duration-300 hover:shadow-md flex flex-col items-center text-center cursor-pointer group`}
      onClick={handleToggle}
    >
      {/* 연결 상태 인디케이터 */}
      {connected && (
        <div className="absolute top-2 right-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
      )}

      {/* 아이콘 */}
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${config.bgColor} mb-3 group-hover:scale-110 transition-transform duration-200`}
      >
        <div className={config.iconColor}>{config.icon}</div>
      </div>

      {/* 제목 */}
      <h3 className="text-sm font-bold text-gray-900 mb-1">{config.name}</h3>

      {/* 상태 */}
      <div className="mb-3">
        {connected ? (
          <span className="text-xs text-green-600 font-medium">연결됨</span>
        ) : (
          <span className="text-xs text-gray-500">연결 안됨</span>
        )}
      </div>

      {/* 설정 버튼 (연결된 경우) */}
      {connected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleConfigure();
          }}
          className="w-full px-3 py-1.5 rounded-md border border-gray-300 text-xs text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
        >
          설정
        </button>
      )}
    </div>
  );
}
