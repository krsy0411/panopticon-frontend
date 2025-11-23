'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { StepIndicator } from './StepIndicator';
import { StepContainer } from './StepContainer';
import { StepHeader } from './StepHeader';
import { InstallSection } from './InstallSection';
import { StepChecklist } from './StepChecklist';

export default function InstallGuideLayout({ steps, icon }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = steps.length;
  const activeStep = useMemo(() => steps[currentStep - 1], [currentStep, steps]);

  // scroll function
  const scrollToTop = () => {
    const el = document.getElementById('top');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    scrollToTop();
  };

  const handleNext = () => {
    if (currentStep === totalSteps) {
      router.push('/services');
    } else {
      setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
      scrollToTop();
    }
  };

  return (
    <div className="bg-linear-to-br from-blue-50 via-white to-cyan-50">
      {/* scroll target */}
      <div id="top"></div>

      <div className="mx-auto max-w-4xl px-6 py-16">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} className="mb-12" />

        <StepContainer>
          <StepHeader
            icon={icon}
            subtitle={activeStep.subtitle}
            title={activeStep.title}
            meta={activeStep.meta}
          />

          <p className="mt-6 whitespace-pre-line text-base text-gray-700">
            {activeStep.description}
          </p>

          <div className="mt-8 space-y-10">
            {activeStep.sections.map((section, idx) => (
              <InstallSection key={idx} {...section} />
            ))}
          </div>

          {activeStep.checklist && <StepChecklist title="설정 확인" items={activeStep.checklist} />}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-between">
            {/* 이전 단계 */}
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 disabled:text-gray-400"
            >
              이전 단계
            </button>

            {/* 다음 단계 */}
            <button
              onClick={handleNext}
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {currentStep === totalSteps ? '대시보드로 이동' : '다음 단계'}
            </button>
          </div>
        </StepContainer>
      </div>
    </div>
  );
}
