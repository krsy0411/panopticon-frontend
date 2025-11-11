'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoArrowBack } from 'react-icons/io5';
import { StepIndicator } from './docker/StepIndicator';
import { InstallStep, MonitoringOptions, PlatformType, StepConfig } from '@/types/agent-install';
import { platformsData } from '@/app/(authenticated)/install/platforms';
import {
  DockerStepOne,
  DockerStepThree,
  DockerStepTwo,
  DockerVerificationStep,
} from './docker/DockerSteps';
import {
  KubernetesStepOne,
  KubernetesStepTwo,
  KubernetesStepThree,
  KubernetesStepFour,
} from './kubernetes/KubernetesSteps';
import { CopyableCodeBlock } from './CopyableCodeBlock';

const platformStepConfig: Record<PlatformType, StepConfig> = {
  docker: { total: 4, showOptions: true },
  kubernetes: { total: 4, showOptions: true },
  ecs: { total: 3, showOptions: true },
  macos: { total: 3, showOptions: false },
  opentelemetry: { total: 3, showOptions: true },
  fluentbit: { total: 1, showOptions: false },
};

type Props = { platformKey: PlatformType };
export default function PlatformInstallClient({ platformKey }: Props) {
  const router = useRouter();
  const platform = platformsData[platformKey];
  const stepConfig = platformStepConfig[platformKey] || { total: 3, showOptions: true };

  const [currentStep, setCurrentStep] = useState<InstallStep>(1);
  const [apiKey, setApiKey] = useState('');
  const kafkaBroker = 'kafka.panopticon.io:9092';
  const [monitoringOptions, setMonitoringOptions] = useState<MonitoringOptions>({
    traces: true,
    metrics: true,
    logs: false,
  });
  const [connectionStatus, setConnectionStatus] = useState<
    'testing' | 'connected' | 'failed' | null
  >(null);
  const [verificationAcknowledged, setVerificationAcknowledged] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  if (!platform) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Platform not found</h1>
          <button
            onClick={() => router.push('/install')}
            className="text-blue-600 underline transition hover:text-blue-700"
          >
            Go back to platform selection
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => router.push('/install');

  const handleNextStep = () => {
    if (currentStep < stepConfig.total) {
      setCurrentStep((prev) => (prev + 1) as InstallStep);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as InstallStep);
    }
  };

  const handleToggleOption = (option: keyof MonitoringOptions) => {
    setMonitoringOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleTestConnection = () => {
    setConnectionStatus('testing');
    setTimeout(() => {
      const isConnected = Math.random() > 0.3;
      setConnectionStatus(isConnected ? 'connected' : 'failed');
    }, 3000);
  };

  const handleVerificationToggle = (checked: boolean) => {
    setVerificationAcknowledged(checked);
    if (!checked) {
      setVerificationComplete(false);
    }
  };

  const handleInstallComplete = () => {
    if (!verificationAcknowledged) {
      return;
    }
    setIsInstalling(true);
    setTimeout(() => {
      setIsInstalling(false);
      setVerificationComplete(true);
    }, 2000);
  };

  const renderGenericInstallation = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            {platform.iconLarge}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{platform.title}</h2>
              <p className="text-gray-600 mt-1">{platform.description}</p>
            </div>
          </div>
        </div>

        {/* Installation Steps */}
        {platform.steps.map((step, index) => (
          <div key={index} className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">{step.title}</h2>

            {step.description && <p className="mb-4 text-gray-600">{step.description}</p>}

            {step.code && <CopyableCodeBlock code={step.code} />}
          </div>
        ))}

        {/* Next Steps */}
        <div className="rounded-xl bg-blue-50 p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">다음 단계</h3>
          <p className="text-blue-800 mb-4">
            에이전트 배포가 완료되면 애플리케이션 데이터가 Panopticon으로 전송됩니다.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/install')}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
            >
              설치 페이지로 돌아가기
            </button>
            <button
              onClick={() => router.push('/main')}
              className="rounded-lg border border-blue-600 bg-white px-6 py-2 text-blue-600 transition hover:bg-blue-50"
            >
              대시보드로 이동
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    // Docker와 Kubernetes는 특별한 Step UI 사용, 나머지는 일반 설치 가이드
    if (platformKey === 'docker') {
      return renderDockerSteps();
    }

    if (platformKey === 'kubernetes') {
      return renderKubernetesSteps();
    }

    // 일반 플랫폼 (Fluent Bit 등)
    return renderGenericInstallation();
  };

  const renderDockerSteps = () => {
    switch (currentStep) {
      case 1:
        return (
          <DockerStepOne
            icon={platform.iconLarge}
            title={platform.title}
            totalSteps={stepConfig.total}
            monitoringOptions={monitoringOptions}
            onToggleOption={handleToggleOption}
            onNext={handleNextStep}
          />
        );
      case 2:
        return (
          <DockerStepTwo
            icon={platform.iconLarge}
            title={platform.title}
            totalSteps={stepConfig.total}
            kafkaBroker={kafkaBroker}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            monitoringOptions={monitoringOptions}
            onPrev={handlePrevStep}
            onNext={handleNextStep}
          />
        );
      case 3:
        return (
          <DockerStepThree
            icon={platform.iconLarge}
            title={platform.title}
            totalSteps={stepConfig.total}
            monitoringOptions={monitoringOptions}
            kafkaBroker={kafkaBroker}
            connectionStatus={connectionStatus}
            onTestConnection={handleTestConnection}
            onPrev={handlePrevStep}
            onNext={handleNextStep}
          />
        );
      case 4:
        return (
          <DockerVerificationStep
            icon={platform.iconLarge}
            title={platform.title}
            totalSteps={stepConfig.total}
            verificationAcknowledged={verificationAcknowledged}
            verificationComplete={verificationComplete}
            isInstalling={isInstalling}
            onVerificationChange={handleVerificationToggle}
            onPrev={handlePrevStep}
            onComplete={handleInstallComplete}
            onInstallAnother={handleBack}
            onGoDashboard={() => router.push('/main')}
          />
        );
      default:
        return null;
    }
  };

  const renderKubernetesSteps = () => {
    switch (currentStep) {
      case 1:
        return (
          <KubernetesStepOne
            icon={platform.iconLarge}
            title={platform.title}
            totalSteps={stepConfig.total}
            onNext={handleNextStep}
          />
        );
      case 2:
        return (
          <KubernetesStepTwo
            icon={platform.iconLarge}
            title={platform.title}
            totalSteps={stepConfig.total}
            onPrev={handlePrevStep}
            onNext={handleNextStep}
          />
        );
      case 3:
        return (
          <KubernetesStepThree
            icon={platform.iconLarge}
            title={platform.title}
            totalSteps={stepConfig.total}
            onPrev={handlePrevStep}
            onNext={handleNextStep}
          />
        );
      case 4:
        return (
          <KubernetesStepFour
            icon={platform.iconLarge}
            title={platform.title}
            totalSteps={stepConfig.total}
            onPrev={handlePrevStep}
            onInstallAnother={handleBack}
            onGoDashboard={() => router.push('/main')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-cyan-50">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <button
          onClick={handleBack}
          className="mb-8 flex items-center gap-2 text-blue-600 transition hover:text-blue-700"
        >
          <IoArrowBack className="h-5 w-5" />
          <span>다른 플랫폼 선택</span>
        </button>

        <StepIndicator currentStep={currentStep} totalSteps={stepConfig.total} />

        {renderContent()}
      </div>
    </div>
  );
}
