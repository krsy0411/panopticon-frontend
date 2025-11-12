// 전체 Error 섹션 조립
'use client';

import ErrorSummary from '../errors/Summary';
import ErrorTrendChart from '../errors/TrendChart';
import ErrorDistribution from '../errors/Distribution';

interface ErrorsSectionProps {
  serviceName: string;
}

export default function ErrorsSection({ serviceName }: ErrorsSectionProps) {
  return (
    <div className="space-y-6">
      <ErrorSummary serviceName={serviceName} />
      <ErrorTrendChart serviceName={serviceName} />
      <ErrorDistribution serviceName={serviceName} />
    </div>
  );
}
