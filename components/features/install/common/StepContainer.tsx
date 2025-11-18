// 흰색 박스 + 그림자 + 패딩 Wrapper

'use client';

export function StepContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white/95 p-8 shadow-xl shadow-blue-100/40">
      {children}
    </div>
  );
}
