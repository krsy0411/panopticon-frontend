// SLO 전체 상태 요약 배너

import type { NotificationSummary } from '@/src/types/notification';
import { StatusBadge } from './StatusBadge';

interface ServiceStatusBannerProps {
  summary: NotificationSummary;
  onClick?: () => void;
}

export function ServiceStatusBanner({ summary, onClick }: ServiceStatusBannerProps) {
  return (
    <div
      onClick={onClick}
      className="
        cursor-pointer rounded-2xl
        bg-white/90 backdrop-blur-md
        border border-gray-200 shadow-sm
        hover:shadow-lg hover:-translate-y-0.5
        transition-all duration-200 p-6
      "
    >
      {/* 상단: 상태 + 제목 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <StatusBadge status={summary.overallStatus} />
          <span className="text-xl font-semibold text-gray-900">서비스 종합 상태</span>
        </div>
      </div>

      {/* 메트릭 4개 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-gray-700">
        {/* 문제 SLO */}
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">문제 SLO</span>
          <span className="text-2xl font-bold text-gray-900">{summary.problemCount}개</span>
        </div>

        {/* 지난 24시간 가용성 */}
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">지난 24시간 가용성</span>
          <span className="text-2xl font-bold text-gray-900">
            {summary.availability24h.toFixed(2)}%
          </span>
        </div>

        {/* 허용치 초과 */}
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">허용치 초과</span>
          <span className="text-2xl font-bold text-gray-900">
            {summary.errorBudgetTotalOverPct > 0
              ? `+${summary.errorBudgetTotalOverPct.toFixed(1)}%`
              : '0%'}
          </span>
        </div>

        {/* 최근 경고 */}
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">최근 경고</span>
          <span className="text-sm font-semibold text-gray-900 leading-tight">
            {summary.lastAlert}
          </span>
        </div>
      </div>

      {/* 하단 안내 */}
      <p className="mt-4 text-xs text-gray-500">클릭하면 문제 SLO 목록 위치로 이동합니다.</p>
    </div>
  );
}
