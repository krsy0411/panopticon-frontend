// 여러 SLO 항목을 리스트 형태로 보여줌

import type { ComputedSlo } from '@/src/types/notification';
import { StatusBadge } from './StatusBadge';

interface SloStatusListProps {
  items: ComputedSlo[]; // 화면에 표시할 SLO 목록
  onSelect?: (slo: ComputedSlo) => void; // 항목 클릭 시 실행되는 콜백
}

export function SloStatusList({ items, onSelect }: SloStatusListProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* --- 헤더 영역 --- */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-gray-900">SLO 리스트</div>
          <p className="text-xs text-gray-500">상태 배지는 항목 왼쪽에 표시됩니다.</p>
        </div>

        {/* SLO 개수 표시 */}
        <div className="text-xs text-gray-500">{items.length}개</div>
      </div>

      {/* --- 리스트 본문 --- */}
      <div className="space-y-3">
        {items.map((slo) => (
          <button
            key={slo.id}
            type="button"
            // clicked SLO를 상위 컴포넌트로 전달
            onClick={() => onSelect?.(slo)}
            className="w-full rounded-lg border border-gray-100 px-3 py-2 text-left
                       transition-colors duration-150 hover:border-gray-200"
          >
            <div className="flex items-center gap-3">
              {/* 상태 배지: GOOD / WARNING / FAILED */}
              <StatusBadge status={slo.status} size="sm" />

              {/* SLO 이름 + 허용치 요약 정보 */}
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">{slo.name}</div>

                <div className="text-xs text-gray-500">
                  남은 허용치 {slo.errorBudgetRemainingPct.toFixed(1)}% · 사용률{' '}
                  {(slo.errorBudgetUsedRate * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
