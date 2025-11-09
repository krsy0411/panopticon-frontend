'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import FeatureCard from '@/components/ui/FeatureCard';
import ArrowRight from '@/components/icons/landing/ArrowRight';
import BarChart3 from '@/components/icons/landing/BarChart3';
import Zap from '@/components/icons/landing/Zap';
import AlertTriangle from '@/components/icons/landing/Error';
import Activity from '@/components/icons/landing/Activity';
import UnAuthenticatedHeader from '@/components/common/Header';

export default function LandingPage() {
  const router = useRouter();
  const handleNavigate = () => {
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-cyan-50">
      <UnAuthenticatedHeader handleNavigate={handleNavigate} />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl mb-6 bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-bold">
            Application Performance Monitoring
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            실시간 모니터링과 강력한 APM으로 애플리케이션의 성능을 최적화하세요. Agent 기반
            모니터링으로 모든 메트릭을 한눈에 파악할 수 있습니다.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleNavigate} size="lg" className="gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg">
              View Demo
            </Button>
          </div>
        </div>

        {/* Features */}
        <div
          id="features"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-24 place-items-center"
        >
          <FeatureCard
            icon={<Activity className="w-6 h-6" />}
            title="Agent Monitoring"
            description="실시간 시스템 로그와 메트릭을 모니터링합니다"
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="APM"
            description="애플리케이션 성능을 추적하고 병목 현상을 파악합니다"
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="Real-time Alerts"
            description="중요한 이벤트 발생 시 즉시 알림을 받습니다"
          />
          <FeatureCard
            icon={<AlertTriangle className="w-6 h-6 text-purple-600" />}
            title="Error Tracking"
            description="애플리케이션 오류를 실시간으로 탐지하고 원인을 추적합니다."
          />
        </div>
      </section>
    </div>
  );
}
