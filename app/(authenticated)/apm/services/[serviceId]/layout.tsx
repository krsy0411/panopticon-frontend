import Sidebar from '@/components/features/apm/services/[serviceId]/Sidebar';

export async function generateStaticParams() {
  const services = ['auth', 'user', 'frontend', 'backend', 'payment'];
  return services.map((id) => ({ serviceId: id }));
}

export default function ApmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-6 p-6 bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
