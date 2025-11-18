'use client';

import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NotificationIntegrationCard from '@/components/features/notification/NotificationIntegrationCard';
import type { IntegrationType } from '@/components/features/notification/NotificationIntegrationCard';
import SLOConfiguration from '@/components/features/notification/SLOConfiguration';
import type { SLOTarget } from '@/components/features/notification/SLOConfiguration';

import SlackConfigModal from '@/components/features/notification/modals/SlackConfigModal';
import type { SlackConfig } from '@/components/features/notification/modals/SlackConfigModal';
import EmailConfigModal from '@/components/features/notification/modals/EmailConfigModal';
import type { EmailConfig } from '@/components/features/notification/modals/EmailConfigModal';
import DiscordConfigModal from '@/components/features/notification/modals/DiscordConfigModal';
import type { DiscordConfig } from '@/components/features/notification/modals/DiscordConfigModal';
import TeamsConfigModal from '@/components/features/notification/modals/TeamsConfigModal';
import type { TeamsConfig } from '@/components/features/notification/modals/TeamsConfigModal';
import GitHubConfigModal from '@/components/features/notification/modals/GitHubConfigModal';
import type { GitHubConfig } from '@/components/features/notification/modals/GitHubConfigModal';
import JiraConfigModal from '@/components/features/notification/modals/JiraConfigModal';
import type { JiraConfig } from '@/components/features/notification/modals/JiraConfigModal';
import TrelloConfigModal from '@/components/features/notification/modals/TrelloConfigModal';
import type { TrelloConfig } from '@/components/features/notification/modals/TrelloConfigModal';

interface ConnectionState {
  [key: string]: boolean;
}

// localStorage에서 연동 상태를 로드하는 함수
function loadConnectionsFromStorage(): ConnectionState {
  if (typeof window === 'undefined') return {};

  const types: IntegrationType[] = [
    'discord',
    'slack',
    'teams',
    'email',
    'jira',
    'github',
    'trello',
  ];
  const initial: ConnectionState = {};
  types.forEach((t) => {
    const v = localStorage.getItem(`notification_${t}`);
    if (v) initial[t] = true;
  });
  return initial;
}

export default function NotificationPage() {
  const [connections, setConnections] = useState<ConnectionState>({});
  const [activeModal, setActiveModal] = useState<IntegrationType | null>(null);

  // 컴포넌트 마운트 시 localStorage 로드
  // 이는 CSR에서만 실행되므로 hydration 에러를 방지합니다
  useEffect(() => {
    const loaded = loadConnectionsFromStorage();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConnections(loaded);
  }, []);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [activeModal]);

  // 모달 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeModal]);

  const handleConnect = (type: IntegrationType) => {
    setActiveModal(type);
  };

  const handleDisconnect = (type: IntegrationType) => {
    setConnections((prev) => ({ ...prev, [type]: false }));
    // TODO: localStorage 또는 API에서 설정 제거
    localStorage.removeItem(`notification_${type}`);
  };

  const handleConfigure = (type: IntegrationType) => {
    setActiveModal(type);
  };

  const handleSLOSave = (targets: SLOTarget[]) => {
    console.log('SLO 설정 저장:', targets);
    localStorage.setItem('slo_targets', JSON.stringify(targets));
    toast.success('SLO 설정이 저장되었습니다!');
  };

  // Slack 설정 저장
  const handleSlackSave = (config: SlackConfig) => {
    localStorage.setItem('notification_slack', JSON.stringify(config));
    setConnections((prev) => ({ ...prev, slack: true }));
    setActiveModal(null);
    toast.success('Slack 연동이 완료되었습니다!');
  };

  // Email 설정 저장
  const handleEmailSave = (config: EmailConfig) => {
    localStorage.setItem('notification_email', JSON.stringify(config));
    setConnections((prev) => ({ ...prev, email: true }));
    setActiveModal(null);
    toast.success('Email 연동이 완료되었습니다!');
  };

  // Discord 설정 저장
  const handleDiscordSave = (config: DiscordConfig) => {
    localStorage.setItem('notification_discord', JSON.stringify(config));
    setConnections((prev) => ({ ...prev, discord: true }));
    setActiveModal(null);
    toast.success('Discord 연동이 완료되었습니다!');
  };

  // Teams 설정 저장
  const handleTeamsSave = (config: TeamsConfig) => {
    localStorage.setItem('notification_teams', JSON.stringify(config));
    setConnections((prev) => ({ ...prev, teams: true }));
    setActiveModal(null);
    toast.success('Teams 연동이 완료되었습니다!');
  };

  // GitHub 설정 저장
  const handleGitHubSave = (config: GitHubConfig) => {
    localStorage.setItem('notification_github', JSON.stringify(config));
    setConnections((prev) => ({ ...prev, github: true }));
    setActiveModal(null);
    toast.success('GitHub 연동이 완료되었습니다!');
  };

  // Jira 설정 저장
  const handleJiraSave = (config: JiraConfig) => {
    localStorage.setItem('notification_jira', JSON.stringify(config));
    setConnections((prev) => ({ ...prev, jira: true }));
    setActiveModal(null);
    toast.success('Jira 연동이 완료되었습니다!');
  };

  // Trello 설정 저장
  const handleTrelloSave = (config: TrelloConfig) => {
    localStorage.setItem('notification_trello', JSON.stringify(config));
    setConnections((prev) => ({ ...prev, trello: true }));
    setActiveModal(null);
    toast.success('Trello 연동이 완료되었습니다!');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            알림 서비스 관리
          </h1>
          <p className="text-sm text-gray-600">
            외부 서비스 연동 및 SLO 설정으로 실시간 알림을 받아보세요
          </p>
        </div>

        {/* 상단: 가이드 섹션 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-900">알림 설정 가이드</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                1
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">서비스 연동</h3>
                <p className="text-xs text-gray-600">
                  7가지 협업 도구 중 원하는 서비스를 연결하세요.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                2
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">SLO 목표 설정</h3>
                <p className="text-xs text-gray-600">가용성, 레이턴시, 에러율 목표를 설정하세요.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                3
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">알림 수신</h3>
                <p className="text-xs text-gray-600">
                  SLO 목표 미달 시 연동된 서비스로 실시간 알림을 받습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2단 레이아웃: 왼쪽 연동 서비스, 오른쪽 SLO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 왼쪽: 연동 서비스 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">외부 서비스 연동</h2>
                <p className="text-sm text-gray-600 mt-1">
                  다양한 협업 도구와 연동하여 알림을 받아보세요
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <NotificationIntegrationCard
                type="discord"
                isConnected={connections.discord}
                onConnect={() => handleConnect('discord')}
                onDisconnect={() => handleDisconnect('discord')}
                onConfigure={() => handleConfigure('discord')}
              />
              <NotificationIntegrationCard
                type="slack"
                isConnected={connections.slack}
                onConnect={() => handleConnect('slack')}
                onDisconnect={() => handleDisconnect('slack')}
                onConfigure={() => handleConfigure('slack')}
              />
              <NotificationIntegrationCard
                type="teams"
                isConnected={connections.teams}
                onConnect={() => handleConnect('teams')}
                onDisconnect={() => handleDisconnect('teams')}
                onConfigure={() => handleConfigure('teams')}
              />
              <NotificationIntegrationCard
                type="email"
                isConnected={connections.email}
                onConnect={() => handleConnect('email')}
                onDisconnect={() => handleDisconnect('email')}
                onConfigure={() => handleConfigure('email')}
              />
              <NotificationIntegrationCard
                type="jira"
                isConnected={connections.jira}
                onConnect={() => handleConnect('jira')}
                onDisconnect={() => handleDisconnect('jira')}
                onConfigure={() => handleConfigure('jira')}
              />
              <NotificationIntegrationCard
                type="github"
                isConnected={connections.github}
                onConnect={() => handleConnect('github')}
                onDisconnect={() => handleDisconnect('github')}
                onConfigure={() => handleConfigure('github')}
              />
              <NotificationIntegrationCard
                type="trello"
                isConnected={connections.trello}
                onConnect={() => handleConnect('trello')}
                onDisconnect={() => handleDisconnect('trello')}
                onConfigure={() => handleConfigure('trello')}
              />
            </div>
          </div>

          {/* 오른쪽: SLO 설정 */}
          <div>
            <SLOConfiguration onSave={handleSLOSave} />
          </div>
        </div>
      </div>

      {/* Modal Components (controlled by activeModal) */}
      <SlackConfigModal
        isOpen={activeModal === 'slack'}
        onClose={() => setActiveModal(null)}
        onSave={handleSlackSave}
      />
      <EmailConfigModal
        isOpen={activeModal === 'email'}
        onClose={() => setActiveModal(null)}
        onSave={handleEmailSave}
      />
      <DiscordConfigModal
        isOpen={activeModal === 'discord'}
        onClose={() => setActiveModal(null)}
        onSave={handleDiscordSave}
      />
      <TeamsConfigModal
        isOpen={activeModal === 'teams'}
        onClose={() => setActiveModal(null)}
        onSave={handleTeamsSave}
      />
      <GitHubConfigModal
        isOpen={activeModal === 'github'}
        onClose={() => setActiveModal(null)}
        onSave={handleGitHubSave}
      />
      <JiraConfigModal
        isOpen={activeModal === 'jira'}
        onClose={() => setActiveModal(null)}
        onSave={handleJiraSave}
      />
      <TrelloConfigModal
        isOpen={activeModal === 'trello'}
        onClose={() => setActiveModal(null)}
        onSave={handleTrelloSave}
      />
      <ToastContainer position="top-right" autoClose={1000} />
    </div>
  );
}
