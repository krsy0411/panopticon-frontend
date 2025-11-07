'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Logo from '@/components/icons/Logo';
import { platformsData, PlatformType } from '../platforms';
import { IoArrowBack } from 'react-icons/io5';
import { StepIndicator } from './StepIndicator';
import {
  DockerStepOne,
  DockerStepTwo,
  DockerStepThree,
  DockerVerificationStep,
} from './DockerSteps';
import { InstallStep, MonitoringOptions, StepConfig } from './types';

const platformStepConfig: Record<PlatformType, StepConfig> = {
  docker: { total: 4, showOptions: true },
  kubernetes: { total: 3, showOptions: true },
  ecs: { total: 3, showOptions: true },
  macos: { total: 3, showOptions: false },
  opentelemetry: { total: 3, showOptions: true },
};

export default function PlatformInstallPage() {
  const router = useRouter();
  const params = useParams();
  const platformKey = params.platform as PlatformType;
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Platform not found</h1>
          <button
            onClick={() => router.push('/agent-install')}
            className="text-blue-600 underline transition hover:text-blue-700"
          >
            Go back to platform selection
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => router.push('/agent-install');

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

  const renderContent = () => {
    if (platformKey !== 'docker') {
      return (
        <section className="rounded-2xl border border-dashed border-gray-300 bg-white/80 p-12 text-center text-gray-400">
          <div className="text-lg font-semibold text-gray-500">작성 전</div>
        </section>
      );
    }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
        </div>
      </header>

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
