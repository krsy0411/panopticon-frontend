/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { SloCard } from '@/components/features/notification/slo/SloCard';
import { SloActionModal } from '@/components/features/notification/modals/SloActionModal';
import SloCreateModal from '@/components/features/notification/modals/SloCreateModal';
import { getWebhooks } from '@/src/api/webhook';
import { createSlo, getSlos, deleteSlo, updateSlo } from '@/src/api/slo';
import type {
  ComputedSlo,
  IntegrationType,
  SloCreateInput,
  IntegrationStatus,
} from '@/src/types/notification';

interface WebhookConnection {
  webhookId?: string;
  lastTestAt?: string;
  lastTestResult?: 'success' | 'failure';
}

interface ConnectionState {
  [key: string]: WebhookConnection;
}

/**
 * SLO 상태 판정: 에러 허용치 사용률에 따라 결정
 * - GOOD: 허용치 사용률 50% 이하 (남은 허용치 50% 이상)
 * - WARNING: 허용치 사용률 50~90% (남은 허용치 10~50%)
 * - FAILED: 허용치 사용률 90% 초과 (남은 허용치 10% 미만)
 */
const deriveStatus = (errorBudgetUsedRate: number) => {
  const usedPercent = errorBudgetUsedRate * 100;

  if (usedPercent <= 50) return 'GOOD' as const;
  if (usedPercent <= 90) return 'WARNING' as const;
  return 'FAILED' as const;
};

export default function NotificationPage() {
  const [connections, setConnections] = useState<ConnectionState>({});
  const [activeModal, setActiveModal] = useState<IntegrationType | null>(null);
  const [actionState, setActionState] = useState<{
    type: 'delete' | 'edit';
    target: ComputedSlo | null;
  }>({
    type: 'edit',
    target: null,
  });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<SloCreateInput | null>(null);
  const [userSlos, setUserSlos] = useState<SloCreateInput[]>([]);
  const [integrationStatuses, setIntegrationStatusesState] = useState<IntegrationStatus[]>([
    { type: 'slack', connected: false, connectedSloCount: 0, lastTestResult: null },
    { type: 'email', connected: false, connectedSloCount: 0, lastTestResult: null },
    { type: 'teams', connected: false, connectedSloCount: 0, lastTestResult: null },
    { type: 'discord', connected: false, connectedSloCount: 0, lastTestResult: null },
  ]);

  // authserver에서 웹훅 및 SLO 정보 불러오기 (페이지 마운트시 한 번 실행)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 웹훅 정보 불러오기
        const webhooks = await getWebhooks();
        const newConnections: ConnectionState = {};

        webhooks.forEach((webhook) => {
          const connection: WebhookConnection = {
            webhookId: webhook.id,
            lastTestAt: webhook.lastTestedAt,
            lastTestResult: webhook.lastTestedAt ? 'success' : undefined,
          };

          if (webhook.type === 'slack') {
            newConnections.slack = connection;
          } else if (webhook.type === 'discord') {
            newConnections.discord = connection;
          } else if (webhook.type === 'teams') {
            newConnections.teams = connection;
          } else if (webhook.type === 'email') {
            newConnections.email = connection;
          }
        });

        setConnections(newConnections);
      } catch (error) {
        console.error('Failed to fetch webhooks:', error);
      }

      try {
        // SLO 목록 불러오기
        const sloList = await getSlos();
        const sloInputs: SloCreateInput[] = sloList.map((slo) => ({
          id: slo.id,
          name: slo.name,
          metric: slo.metric as 'availability' | 'latency' | 'error_rate',
          target: slo.target,
          sliValue: slo.sliValue,
          actualDowntimeMinutes: slo.actualDowntimeMinutes,
          totalMinutes: slo.totalMinutes,
          connectedChannels: slo.connectedChannels as ('slack' | 'email' | 'teams' | 'discord')[],
          tooltipTitle: '',
          tooltipDescription: '',
          description: slo.description,
          timeRangeKey: '24h',
        }));
        setUserSlos(sloInputs);
      } catch (error) {
        console.error('Failed to fetch SLOs:', error);
      }
    };

    fetchData();
  }, []);

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
    setConnections((prev) => {
      const { [type]: _, ...rest } = prev;
      return rest;
    });
  };

  const mergedIntegrations = integrationStatuses.map((integration) => {
    const connState = connections[integration.type];
    return {
      ...integration,
      connected: !!connState?.webhookId,
      lastTestResult: connState?.lastTestResult ?? integration.lastTestResult ?? null,
      lastTestAt: connState?.lastTestAt ?? integration.lastTestAt,
    };
  });

  // 허용치 기반 SLO 상태 계산 로직
  const computeSlo = useCallback((input: SloCreateInput): ComputedSlo => {
    // SLO 생성 시 지정된 totalMinutes 사용 (필수)
    const totalMinutes = input.totalMinutes || 60 * 24; // 기본값: 24시간
    const errorBudget = 1 - input.sliValue;
    const allowedDowntime = totalMinutes * errorBudget;
    const usedRate = allowedDowntime === 0 ? 0 : input.actualDowntimeMinutes / allowedDowntime;
    return {
      id: input.id,
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
      description: input.description,
      trend: [],
    };
  }, []);

  // 유저 생성 SLO 계산
  const computedUserSlos = useMemo(
    () => userSlos.map((slo) => computeSlo(slo)),
    [userSlos, computeSlo],
  );

  // 최종 SLO 리스트 (유저가 생성한 SLO만 표시)
  const displayedSlos = computedUserSlos;

  //   SLO 생성/삭제/수정 핸들러
  const handleSloEdit = (slo: ComputedSlo) => {
    // SLO 데이터를 SloCreateInput 형식으로 변환해서 edit 모달 열기
    const sloInput: SloCreateInput = {
      id: slo.id,
      name: slo.name,
      description: userSlos.find((s) => s.id === slo.id)?.description,
      metric: slo.metric,
      target: slo.target,
      sliValue: slo.sliValue,
      totalMinutes: slo.totalMinutes,
      actualDowntimeMinutes: slo.actualDowntimeMinutes,
      tooltipTitle: slo.tooltipTitle,
      tooltipDescription: slo.tooltipDescription,
      connectedChannels: slo.connectedChannels,
      timeRangeKey: userSlos.find((s) => s.id === slo.id)?.timeRangeKey || '24h',
    };
    setEditingData(sloInput);
    setCreateModalOpen(true);
  };

  const handleSloDelete = (slo: ComputedSlo) => {
    setActionState({ type: 'delete', target: slo });
  };

  const handleCreateSlo = async (input: SloCreateInput) => {
    const isEditMode = editingData !== null;

    try {
      if (isEditMode) {
        // SLO 수정 요청
        const updatedSlo = await updateSlo(input.id, {
          name: input.name,
          metric: input.metric,
          target: input.target,
          totalMinutes: input.totalMinutes,
          connectedChannels: input.connectedChannels,
          description: input.description,
        });

        // 로컬 상태 업데이트
        setUserSlos((prev) =>
          prev.map((slo) =>
            slo.id === input.id
              ? {
                  ...slo,
                  name: updatedSlo.name,
                  metric: updatedSlo.metric as 'availability' | 'latency' | 'error_rate',
                  target: updatedSlo.target,
                  totalMinutes: updatedSlo.totalMinutes,
                  connectedChannels: updatedSlo.connectedChannels as (
                    | 'slack'
                    | 'email'
                    | 'teams'
                    | 'discord'
                  )[],
                  description: updatedSlo.description,
                }
              : slo,
          ),
        );

        setCreateModalOpen(false);
        setEditingData(null);
        toast.success('SLO가 수정되었습니다.');
      } else {
        // SLO 생성 요청
        const createdSlo = await createSlo({
          name: input.name,
          metric: input.metric,
          target: input.target,
          sliValue: input.sliValue ?? 0,
          actualDowntimeMinutes: input.actualDowntimeMinutes ?? 0,
          totalMinutes: input.totalMinutes ?? 1440,
          connectedChannels: input.connectedChannels,
          description: input.description,
        });

        // 로컬 상태에 추가
        const newInput: SloCreateInput = {
          id: createdSlo.id,
          name: createdSlo.name,
          metric: createdSlo.metric as 'availability' | 'latency' | 'error_rate',
          target: createdSlo.target,
          sliValue: createdSlo.sliValue,
          actualDowntimeMinutes: createdSlo.actualDowntimeMinutes,
          totalMinutes: createdSlo.totalMinutes,
          connectedChannels: createdSlo.connectedChannels as (
            | 'slack'
            | 'email'
            | 'teams'
            | 'discord'
          )[],
          tooltipTitle: '',
          tooltipDescription: '',
          description: createdSlo.description,
          timeRangeKey: '24h',
        };

        setUserSlos((prev) => [...prev, newInput]);
        setCreateModalOpen(false);
        toast.success('SLO가 생성되었습니다.');
      }
    } catch (error) {
      console.error('Failed to create/update SLO:', error);
      toast.error(isEditMode ? 'SLO 수정에 실패했습니다.' : 'SLO 생성에 실패했습니다.');
    }
  };

  const handleActionConfirm = async (slo: ComputedSlo) => {
    try {
      if (actionState.type === 'delete') {
        // API에 SLO 삭제 요청
        await deleteSlo(slo.id);
        setUserSlos((prev) => prev.filter((s) => s.id !== slo.id));
        toast.success(`${slo.name} SLO가 삭제되었습니다.`);
      } else {
        toast.success(`${slo.name} 목표값을 수정했습니다.`);
      }
    } catch (error) {
      console.error('Failed to delete SLO:', error);
      toast.error('SLO 삭제에 실패했습니다.');
    }
    setActionState((prev) => ({ ...prev, target: null }));
  };

  // 각 알림 채널 저장
  const handleSlackSave = (config: SlackConfig) => {
    setConnections((prev) => ({
      ...prev,
      slack: {
        webhookId: config.webhookId,
        lastTestResult: config.lastTestResult,
        lastTestAt: config.lastTestAt,
      },
    }));
    setActiveModal(null);
  };

  const handleEmailSave = (config: EmailConfig) => {
    setConnections((prev) => ({
      ...prev,
      email: {
        webhookId: config.webhookId,
        lastTestResult: config.lastTestResult,
        lastTestAt: config.lastTestAt,
      },
    }));
    setActiveModal(null);
  };

  const handleDiscordSave = (config: DiscordConfig) => {
    setConnections((prev) => ({
      ...prev,
      discord: {
        webhookId: config.webhookId,
        lastTestResult: config.lastTestResult,
        lastTestAt: config.lastTestAt,
      },
    }));
    setActiveModal(null);
  };

  const handleTeamsSave = (config: TeamsConfig) => {
    setConnections((prev) => ({
      ...prev,
      teams: {
        webhookId: config.webhookId,
        lastTestResult: config.lastTestResult,
        lastTestAt: config.lastTestAt,
      },
    }));
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* 상단 제목 */}
        <header className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">알림 &amp; SLO 설정</h1>
          <p className="text-sm text-gray-600">
            알림 채널 연동 현황과 SLO의 허용치를 한눈에 확인하고 조정하세요.
          </p>
        </header>

        {/* 알림 채널 섹션 */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">알림 채널 연동 상태</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mergedIntegrations.map((integration) => (
              <NotificationIntegrationCard
                key={integration.type}
                {...integration}
                isConnected={integration.connected}
                onConnect={() => handleConnect(integration.type)}
                onDisconnect={() => handleDisconnect(integration.type)}
              />
            ))}
          </div>
        </section>

        {/* SLO 목록 */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">SLO 목록</h2>
              <p className="text-sm text-gray-500 mt-2">
                서비스의 SLO(Service Level Objective)를 관리하고 모니터링하세요.
              </p>
            </div>
            {/* 우측 상단: 생성 버튼 */}
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all whitespace-nowrap"
            >
              + SLO 생성
            </button>
          </div>

          {/* SLO 카드 리스트 */}
          {displayedSlos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-7 h-7 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">생성된 SLO가 없습니다.</p>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
                >
                  첫 SLO 생성하기
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedSlos.map((slo) => (
                <SloCard key={slo.id} slo={slo} onEdit={handleSloEdit} onDelete={handleSloDelete} />
              ))}
            </div>
          )}
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

      {/* SLO 생성/수정 모달 */}
      <SloCreateModal
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingData(null);
        }}
        defaultMinutes={60 * 24} // 기본값: 24시간
        onSubmit={handleCreateSlo}
        editingData={editingData}
      />

      {/* toast 메시지 */}
      <ToastContainer position="top-right" autoClose={1200} />
    </div>
  );
}
