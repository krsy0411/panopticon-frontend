import { IoCheckmarkCircle } from 'react-icons/io5';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, index) => index + 1);

  return (
    <div className="mb-8 flex items-center justify-center gap-4">
      {steps.map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-colors ${
              step < currentStep
                ? 'bg-green-400 text-white'
                : step === currentStep
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step < currentStep ? <IoCheckmarkCircle className="h-6 w-6" /> : step}
          </div>
          {step < totalSteps && (
            <div
              className={`mx-2 h-1 w-20 transition-colors ${
                step < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
