// 아이콘 + Step 제목 + subtitle + meta

'use client';

type StepHeaderProps = {
  icon: React.ReactNode;
  subtitle: string;
  title: string;
  meta?: string;
};

export function StepHeader({ icon, subtitle, title, meta }: StepHeaderProps) {
  return (
    <div className="flex flex-wrap items-start gap-4 border-b border-blue-50 pb-6">
      <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">{icon}</div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-blue-500">{subtitle}</p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">{title}</h1>

        {meta && <p className="mt-2 text-sm font-semibold text-gray-500">{meta}</p>}
      </div>
    </div>
  );
}
