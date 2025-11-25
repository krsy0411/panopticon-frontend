'use client';

import { useState, useRef } from 'react';
import { HiXMark } from 'react-icons/hi2';

import type { AgentRuntime, AgentSetupFormValues } from '@/types/agent-install';
import RuntimeEnvironmentStep from './steps/RuntimeEnvironmentStep';
import TelemetryTypeStep from './steps/TelemetryTypeStep';
import ServiceTokenStep from './steps/ServiceTokenStep';
import InstallGuideStep from './steps/InstallGuideStep';
import ValidationStep from './steps/ValidationStep';
import { AGENTS, getDefaultAgentSetupValues } from '@/src/constants/agent-install';

interface AgentSetupPanelProps {
  agentRuntime: AgentRuntime;
  onClose: () => void;
}

type SetupStep = 'runtime' | 'telemetry' | 'token' | 'guide' | 'validation';

export default function AgentSetupPanel({ agentRuntime, onClose }: AgentSetupPanelProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>('runtime');
  const [formValues, setFormValues] = useState<AgentSetupFormValues>(
    getDefaultAgentSetupValues({
      agentRuntime,
      framework: AGENTS.find((a) => a.id === agentRuntime)?.frameworks[0].id,
    }),
  );
  const contentRef = useRef<HTMLDivElement>(null);

  const agent = AGENTS.find((a) => a.id === agentRuntime);
  if (!agent) return null;

  const stepSequence: SetupStep[] = ['runtime', 'telemetry', 'token', 'guide', 'validation'];
  const currentStepIndex = stepSequence.indexOf(currentStep);

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  const handleNext = (newValues?: Partial<AgentSetupFormValues>) => {
    if (newValues) {
      setFormValues((prev) => ({ ...prev, ...newValues }));
    }
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < stepSequence.length) {
      setCurrentStep(stepSequence[nextStepIndex]);
      scrollToTop();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(stepSequence[currentStepIndex - 1]);
      scrollToTop();
    }
  };

  const stepLabels: Record<SetupStep, string> = {
    runtime: 'Runtime Env',
    telemetry: 'Telemetry',
    token: 'Service Token',
    guide: 'Install Guide',
    validation: 'Validation',
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* 헤더 */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">SDK Setup</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900">{agent.label} SDK</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        {/* 진행 상황 표시 - 2줄 */}
        <div className="space-y-3">
          {/* 첫 번째 줄: Step 1-3 */}
          <div className="flex items-center justify-between gap-2">
            {stepSequence.slice(0, 3).map((step, index) => {
              const isActive = step === currentStep;
              const isCompleted = stepSequence.indexOf(step) < currentStepIndex;

              return (
                <div key={step} className="flex flex-1 items-center gap-2">
                  <div
                    className={`h-7 w-7 rounded-full text-xs font-medium flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <span className="text-xs font-medium text-gray-600 truncate">
                    {stepLabels[step]}
                  </span>
                  {index < 2 && (
                    <div
                      className={`flex-1 border-t-2 min-w-2 ${
                        isCompleted ? 'border-green-600' : 'border-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* 두 번째 줄: Step 4-5 */}
          <div className="flex items-center justify-between gap-2">
            {stepSequence.slice(3).map((step, index) => {
              const isActive = step === currentStep;
              const isCompleted = stepSequence.indexOf(step) < currentStepIndex;

              return (
                <div key={step} className="flex flex-1 items-center gap-2">
                  <div
                    className={`h-7 w-7 rounded-full text-xs font-medium flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 4}
                  </div>
                  <span className="text-xs font-medium text-gray-600 truncate">
                    {stepLabels[step]}
                  </span>
                  {index < 1 && (
                    <div
                      className={`flex-1 border-t-2 min-w-2 ${
                        isCompleted ? 'border-green-600' : 'border-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div ref={contentRef} className="flex-1 overflow-y-auto px-6 py-8">
        {currentStep === 'runtime' && (
          <RuntimeEnvironmentStep
            formValues={formValues}
            onChange={setFormValues}
            onNext={handleNext}
            onPrev={currentStepIndex > 0 ? handlePrev : undefined}
          />
        )}

        {currentStep === 'telemetry' && (
          <TelemetryTypeStep
            formValues={formValues}
            onChange={setFormValues}
            onNext={handleNext}
            onPrev={currentStepIndex > 0 ? handlePrev : undefined}
          />
        )}

        {currentStep === 'token' && (
          <ServiceTokenStep
            formValues={formValues}
            onChange={setFormValues}
            onNext={handleNext}
            onPrev={currentStepIndex > 0 ? handlePrev : undefined}
          />
        )}

        {currentStep === 'guide' && (
          <InstallGuideStep
            agent={agent}
            formValues={formValues}
            onNext={handleNext}
            onPrev={currentStepIndex > 0 ? handlePrev : undefined}
          />
        )}

        {currentStep === 'validation' && (
          <ValidationStep
            agent={agent}
            formValues={formValues}
            onPrev={currentStepIndex > 0 ? handlePrev : undefined}
          />
        )}
      </div>
    </div>
  );
}
