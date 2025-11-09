import Sidebar from '@/components/features/apm/services/service_id/Sidebar';

export default function ApmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      {/* 좌측 사이드바 */}
      <Sidebar />

      {/* 본문 */}
      <main className="flex-1 pl-64 p-6 bg-gray-50 min-h-screen">{children}</main>
    </div>
  );
}
