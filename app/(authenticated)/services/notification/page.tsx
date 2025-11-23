'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NotificationIntegrationCard from '@/components/features/notification/NotificationIntegrationCard';
import SlackConfigModal, {
  type SlackConfig,
} from '@/components/features/notification/modals/SlackConfigModal';
import EmailConfigModal, {
  type EmailConfig,
} from '@/components/features/notification/modals/EmailConfigModal';
import DiscordConfigModal, {
  type DiscordConfig,
} from '@/components/features/notification/modals/DiscordConfigModal';
import TeamsConfigModal, {
  type TeamsConfig,
} from '@/components/features/notification/modals/TeamsConfigModal';
import { ServiceStatusBanner } from '@/components/features/notification/slo/ServiceStatusBanner';
import { TimeRangeTabs } from '@/components/features/notification/slo/TimeRangeTabs';
import { SloCard } from '@/components/features/notification/slo/SloCard';
import { SloActionModal } from '@/components/features/notification/modals/SloActionModal';
import { useNotificationMock } from '@/src/hooks/useNotificationMock';
import SloCreateModal from '@/components/features/notification/modals/SloCreateModal';
import type {
  ComputedSlo,
  IntegrationType,
  SloCreateInput,
  TimeRangeOption,
} from '@/src/types/notification';

interface ConnectionState {
  [key: string]: boolean;
}

// 알림 채널 연결 여부 로딩
function loadConnectionsFromStorage(): ConnectionState {
  if (typeof window === 'undefined') return {};

  const types: IntegrationType[] = ['discord', 'slack', 'teams', 'email'];
  const initial: ConnectionState = {};

  // localStorage 값이 있으면 → 연결 true
  types.forEach((t) => {
    const v = localStorage.getItem(`notification_${t}`);
    if (v) initial[t] = true;
  });
  return initial;
}

const deriveStatus = (usedRate: number) => {
  const usedPercent = usedRate * 100;
  if (usedPercent < 70) return 'GOOD' as const;
  if (usedPercent < 100) return 'WARNING' as const;
  return 'FAILED' as const;
};

export default function NotificationPage() {
  const [connections, setConnections] = useState<ConnectionState>(() =>
    loadConnectionsFromStorage(),
  );
  const [activeModal, setActiveModal] = useState<IntegrationType | null>(null);
  const [actionState, setActionState] = useState<{
    type: 'delete' | 'edit';
    target: ComputedSlo | null;
  }>({
    type: 'edit',
    target: null,
  });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [userSlos, setUserSlos] = useState<SloCreateInput[]>([]);
  const problemSectionRef = useRef<HTMLDivElement>(null);

  const { timeRange, setTimeRange, timeRangeOptions, sloList, integrationStatuses, summary } =
    useNotificationMock();

  // 현재 선택된 시간범위(1h/24h...)
  const currentRange = useMemo(
    () => timeRangeOptions.find((option) => option.key === timeRange) as TimeRangeOption,
    [timeRange, timeRangeOptions],
  );

  // ESC 누르면 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [activeModal]);

  // 모달 열리면 배경 스크롤 막기
  useEffect(() => {
    document.body.style.overflow = activeModal ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeModal]);

  // 알림 채널 클릭 → 설정 모달 열기
  const handleConnect = (type: IntegrationType) => {
    setActiveModal(type);
  };

  const handleDisconnect = (type: IntegrationType) => {
    setConnections((prev) => ({ ...prev, [type]: false }));
    localStorage.removeItem(`notification_${type}`);
  };

  const handleConfigure = (type: IntegrationType) => {
    setActiveModal(type);
  };

  const mergedIntegrations = integrationStatuses.map((integration) => ({
    ...integration,
    connected: connections[integration.type] ?? integration.connected,
  }));

  // 허용치 기반 SLO 상태 계산 로직
  const computeSlo = useCallback(
    (input: SloCreateInput): ComputedSlo => {
      const totalMinutes = input.totalMinutes ?? currentRange.minutes;
      const errorBudget = 1 - input.sliValue;
      const allowedDowntime = totalMinutes * errorBudget;
      const usedRate = allowedDowntime === 0 ? 0 : input.actualDowntimeMinutes / allowedDowntime;
      return {
        id: `custom-${input.id}`,
        name: input.name,
        metric: input.metric,
        target: input.target,
        sliValue: input.sliValue,
        totalMinutes,
        actualDowntimeMinutes: input.actualDowntimeMinutes,
        allowedDowntimeMinutes: allowedDowntime,
        errorBudgetUsedRate: usedRate,
        errorBudgetRemainingPct: Math.max(0, (1 - usedRate) * 100),
        errorBudgetOverPct: Math.max(0, usedRate * 100 - 100),
        status: deriveStatus(usedRate),
        tooltipTitle: input.tooltipTitle,
        tooltipDescription: input.tooltipDescription,
        connectedChannels: input.connectedChannels,
        trend: [],
      };
    },
    [currentRange.minutes],
  );

  // 유저 생성 SLO 계산
  const computedUserSlos = useMemo(
    () => userSlos.map((slo) => computeSlo(slo)),
    [userSlos, computeSlo],
  );

  // 최종 SLO 리스트(기본 + 유저)
  const displayedSlos = useMemo(
    () => [...sloList, ...computedUserSlos],
    [sloList, computedUserSlos],
  );

  //   SLO 생성/삭제/수정 핸들러
  const handleSloEdit = (slo: ComputedSlo) => {
    setActionState({ type: 'edit', target: slo });
  };

  const handleSloDelete = (slo: ComputedSlo) => {
    setActionState({ type: 'delete', target: slo });
  };

  const handleCreateSlo = (input: SloCreateInput) => {
    setUserSlos((prev) => [...prev, input]);
    setCreateModalOpen(false);
    toast.success('SLO가 생성되었습니다.');
  };

  const handleActionConfirm = (slo: ComputedSlo) => {
    if (actionState.type === 'delete') {
      toast.warn(`${slo.name} SLO가 삭제되었습니다.`);
    } else {
      toast.success(`${slo.name} 목표값을 수정했습니다.`);
    }
    setActionState((prev) => ({ ...prev, target: null }));
  };

  // 문제 SLO 위치로 스크롤 이동
  const scrollToProblems = () => {
    problemSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 각 알림 채널 저장(localStorage)
  const handleSlackSave = (config: SlackConfig) => {
    localStorage.setItem('notification_slack', JSON.stringify(config));
    localStorage.setItem('panopticon_slack_webhook_url', config.webhookUrl);
    localStorage.setItem('panopticon_slack_enabled', 'true');
    setConnections((prev) => ({ ...prev, slack: true }));
    setActiveModal(null);
    toast.success('Slack 연동이 완료되었습니다.');
  };

  const handleEmailSave = (config: EmailConfig) => {
    localStorage.setItem('notification_email', JSON.stringify(config));
    setConnections((prev) => ({ ...prev, email: true }));
    setActiveModal(null);
    toast.success('Email 연동이 완료되었습니다.');
  };

  const handleDiscordSave = (config: DiscordConfig) => {
    localStorage.setItem('notification_discord', JSON.stringify(config));
    setConnections((prev) => ({ ...prev, discord: true }));
    setActiveModal(null);
    toast.success('Discord 연동이 완료되었습니다.');
  };

  const handleTeamsSave = (config: TeamsConfig) => {
    localStorage.setItem('notification_teams', JSON.stringify(config));
    setConnections((prev) => ({ ...prev, teams: true }));
    setActiveModal(null);
    toast.success('Teams 연동이 완료되었습니다.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* 상단 제목 */}
        <header className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">알림 &amp; SLO 설정</h1>
          <p className="text-sm text-gray-600">
            알림 채널 연동 현황과 SLO의 허용치를 한눈에 확인하고 조정하세요.
          </p>
        </header>

        {/* 서비스 종합 상태 요약 배너 */}
        <ServiceStatusBanner summary={summary} onClick={scrollToProblems} />

        {/* 알림 채널 섹션 */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">알림 채널 연동 상태</h3>
            <p className="text-xs text-gray-500">
              연결 여부, 연결된 SLO 개수, 테스트 메시지 결과를 채널별로 확인하세요.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mergedIntegrations.map((integration) => (
              <NotificationIntegrationCard
                key={integration.type}
                type={integration.type}
                isConnected={integration.connected}
                connectedSloCount={integration.connectedSloCount}
                lastTestResult={integration.lastTestResult}
                lastTestAt={integration.lastTestAt}
                errorMessage={integration.errorMessage}
                onConnect={() => handleConnect(integration.type)}
                onDisconnect={() => handleDisconnect(integration.type)}
                onConfigure={() => handleConfigure(integration.type)}
              />
            ))}
          </div>
        </section>

        {/* SLO 상태 */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">SLO 상태</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-xs text-gray-500">
                  시간 범위에 따라 SLI(지표), 허용치, 상태 배지가 재계산됩니다.
                </p>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  + SLO 생성
                </button>
              </div>
            </div>
            {/* 시간 범위 필터 */}
            <TimeRangeTabs options={timeRangeOptions} value={timeRange} onChange={setTimeRange} />
          </div>

          {/* SLO 카드 리스트 */}
          <div className="space-y-4" ref={problemSectionRef}>
            {displayedSlos.map((slo) => (
              <SloCard key={slo.id} slo={slo} onEdit={handleSloEdit} onDelete={handleSloDelete} />
            ))}
          </div>
        </section>
      </div>

      {/* SLO 삭제/수정 모달 */}
      <SloActionModal
        type={actionState.type}
        open={!!actionState.target}
        slo={actionState.target}
        onConfirm={handleActionConfirm}
        onClose={() => setActionState((prev) => ({ ...prev, target: null }))}
      />

      {/* 알림 채널 설정 모달 */}
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

      {/* SLO 생성 모달 */}
      <SloCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultMinutes={currentRange.minutes}
        onSubmit={handleCreateSlo}
      />

      {/* toast 메시지 */}
      <ToastContainer position="top-right" autoClose={1200} />
    </div>
  );
}
