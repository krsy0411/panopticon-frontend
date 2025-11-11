import Sidebar from '@/components/features/apm/services/[serviceId]/Sidebar';

// output: 'export' + S3/CloudFront 배포를 위한 정적 서비스 목록
export async function generateStaticParams() {
  // 빌드 타임에 알려진 서비스 목록 (하드코딩)
  // 새 서비스 추가 시 이 목록에 추가 후 재빌드
  const services = [
    'user-service',
    'payment-service',
    'order-service',
    'notification-service',
    'auth-service',
    'inventory-service',
  ];

  return services.map((serviceName) => ({
    serviceId: serviceName,
  }));
}

export default function ApmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-6 p-6 bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
