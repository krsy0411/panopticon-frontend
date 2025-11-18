'use client';

import { useRouter } from 'next/navigation';

type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  className?: string;
};

export function StepIndicator({ currentStep, totalSteps, className = '' }: StepIndicatorProps) {
  const router = useRouter();

  return (
    <div className={`w-full flex flex-col items-center gap-4 ${className}`}>
      {/* 상단 버튼 */}
      <button
        onClick={() => router.push('/services')}
        className="self-start text-sm font-semibold text-blue-600 transition hover:text-blue-700"
      >
        서비스 목록으로 이동
      </button>

      {/* 스텝 인디케이터 */}
      <div className="flex w-full justify-center">
        <ol className="flex w-full max-w-2xl items-center gap-4 rounded-full border border-blue-100 bg-white/90 px-6 py-4 shadow-sm backdrop-blur">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;
            const isCompleted = currentStep > stepNumber;

            return (
              <li key={stepNumber} className="flex flex-1 items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition ${
                    isActive
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : isCompleted
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                      : 'border-gray-200 bg-white text-gray-400'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < totalSteps && (
                  <span
                    className={`h-0.5 flex-1 rounded-full ${
                      isCompleted ? 'bg-emerald-400' : isActive ? 'bg-blue-200' : 'bg-gray-200'
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
