'use client';

import { useState } from 'react';
import { SiNodedotjs, SiPython, SiGo, SiPhp, SiDotnet, SiRuby } from 'react-icons/si';
import { FaJava } from 'react-icons/fa';
import type { AgentRuntime } from '@/types/agent-install';
import SlideOverLayout from '@/components/ui/SlideOverLayout';
import AgentSetupPanel from './AgentSetupPanel';
import { AGENTS } from '@/src/constants/agent-install';

const getAgentIcon = (agentId: AgentRuntime) => {
  const iconProps = { className: 'h-8 w-8' };
  switch (agentId) {
    case 'nodejs':
      return <SiNodedotjs {...iconProps} />;
    case 'python':
      return <SiPython {...iconProps} />;
    case 'java':
      return <FaJava {...iconProps} />;
    case 'go':
      return <SiGo {...iconProps} />;
    case 'php':
      return <SiPhp {...iconProps} />;
    case 'dotnet':
      return <SiDotnet {...iconProps} />;
    case 'ruby':
      return <SiRuby {...iconProps} />;
    default:
      return null;
  }
};

// 에이전트별 아이콘 색상 클래스 반환
const getAgentColorClasses = (agentId: AgentRuntime) => {
  switch (agentId) {
    case 'nodejs':
      return { text: 'text-[#83cd29]' };
    case 'python':
      return { text: 'text-[#3776AB]' };
    case 'java':
      return { text: 'text-[#5382A1]' };
    case 'go':
      return { text: 'text-[#00ADD8]' };
    case 'php':
      return { text: 'text-[#777BB4]' };
    case 'dotnet':
      return { text: 'text-[#512BD4]' };
    case 'ruby':
      return { text: 'text-[#CC342D]' };
    default:
      return { text: 'text-blue-600' };
  }
};

export default function AgentSelectionPage() {
  const [selectedAgent, setSelectedAgent] = useState<AgentRuntime | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleAgentSelect = (agentId: AgentRuntime) => {
    setSelectedAgent(agentId);
    setIsPanelOpen(true);
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
    setSelectedAgent(null);
  };

  return (
    <div className="h-full bg-white">
      {/* 헤더 & 메인 콘텐츠 */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">SDK Setup</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">SDK 설치</h1>
          <p className="mt-2 text-gray-600">
            서비스의 런타임 환경에 맞는 SDK를 선택하여 설치를 시작하세요.
          </p>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {AGENTS.map((agent) => {
            const colors = getAgentColorClasses(agent.id);
            const isDisabled = agent.isComingSoon;
            return (
              <button
                key={agent.id}
                onClick={() => !isDisabled && handleAgentSelect(agent.id)}
                disabled={isDisabled}
                className={`group relative overflow-hidden rounded-lg border p-6 text-left transition-all ${
                  isDisabled
                    ? 'border-gray-200 bg-white cursor-not-allowed opacity-75'
                    : 'border-gray-200 bg-white hover:border-blue-500 hover:shadow-lg hover:cursor-pointer'
                }`}
              >
                {/* Coming Soon 배지 */}
                {isDisabled && (
                  <div
                    className="
      absolute inset-0 z-20
      flex items-center justify-center
      bg-gray-300/50      /* 어둡게 */
      backdrop-blur-[1px] /* 흐림 */
    "
                  >
                    <span className="text-2xl font-medium tracking-normal text-black-900">
                      Coming soon
                    </span>
                  </div>
                )}

                <div className="relative z-10 space-y-3">
                  {/* 아이콘 */}
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white ${colors.text}`}
                  >
                    {getAgentIcon(agent.id)}
                  </div>

                  {/* 타이틀 */}
                  <h3 className="text-lg font-semibold text-gray-900">{agent.label}</h3>

                  {/* 설명 */}
                  <p className="text-sm text-gray-600">{agent.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SlideOver 패널 */}
      <SlideOverLayout
        isOpen={isPanelOpen}
        onClose={handlePanelClose}
        widthClass="w-full md:w-[700px] lg:w-[750px]"
        panelClassName="fixed top-0 right-0 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out translate-x-0 overflow-y-auto"
      >
        {selectedAgent && (
          <AgentSetupPanel agentRuntime={selectedAgent} onClose={handlePanelClose} />
        )}
      </SlideOverLayout>
    </div>
  );
}
