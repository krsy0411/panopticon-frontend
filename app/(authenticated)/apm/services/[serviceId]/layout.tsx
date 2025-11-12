import Sidebar from '@/components/features/apm/services/[serviceId]/Sidebar';

// Vercel Dynamic Rendering 활성화
// 런타임에 동적으로 모든 serviceId 값을 처리 가능
export const dynamicParams = true;

export default function ApmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-6 p-6 bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
