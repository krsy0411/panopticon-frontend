// SLO 상태(GOOD / WARNING / FAILED)

import type { SloStatus } from '@/src/types/notification';

// 상태별 스타일 매핑 객체
const badgeConfig: Record<
  SloStatus,
  { label: string; color: string; dot: string; background: string; text: string }
> = {
  GOOD: {
    label: 'GOOD',
    color: 'bg-green-100',
    dot: 'bg-green-500',
    background: 'bg-green-50',
    text: 'text-green-700',
  },
  WARNING: {
    label: 'WARNING',
    color: 'bg-yellow-100',
    dot: 'bg-yellow-500',
    background: 'bg-yellow-50',
    text: 'text-yellow-700',
  },
  FAILED: {
    label: 'FAILED',
    color: 'bg-red-100',
    dot: 'bg-red-500',
    background: 'bg-red-50',
    text: 'text-red-700',
  },
};

interface StatusBadgeProps {
  status: SloStatus;
  variant?: 'pill' | 'dot'; // pill: 알약형 배지 / dot: 점 + 라벨
  size?: 'sm' | 'md'; // 크기 옵션
}

export function StatusBadge({ status, variant = 'pill', size = 'md' }: StatusBadgeProps) {
  const config = badgeConfig[status];

  // --- DOT 스타일 렌더링 (심플하고 리스트에서 주로 사용됨) ---
  if (variant === 'dot') {
    return (
      <span
        className={`
          inline-flex items-center gap-1
          ${size === 'sm' ? 'text-xs' : 'text-sm'}
          ${config.text}
        `}
      >
        {/* colored dot */}
        <span
          className={`
            inline-block rounded-full
            ${config.dot}
            ${size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'}
          `}
        />
        {/* text label */}
        <span className="font-semibold">{config.label}</span>
      </span>
    );
  }

  // --- PILL 스타일 렌더링 (카드 상단에서 강조할 때 사용) ---
  return (
    <span
      className={`
        inline-flex items-center gap-2 rounded-full
        ${config.color} ${config.text}
        ${size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}
        font-semibold
      `}
    >
      {/* 점(dot)만 표시하여 상태 전달 */}
      <span
        className={`
          inline-block rounded-full
          ${config.dot}
          ${size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'}
        `}
      />
      {config.label}
    </span>
  );
}
