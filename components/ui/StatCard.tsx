// 에러 카드 1개 => UI 스타일만 담당

import type { StatItem } from '@/types/apm';
import { BiErrorCircle } from 'react-icons/bi';
import { AiOutlineWarning } from 'react-icons/ai';
import { FiInfo, FiList } from 'react-icons/fi';

const toneMap: Record<NonNullable<StatItem['tone']>, string> = {
  neutral: 'text-gray-900',
  danger: 'text-red-600',
  warning: 'text-amber-600',
  info: 'text-blue-600',
};

const iconMap = (tone: NonNullable<StatItem['tone']>) => {
  switch (tone) {
    case 'danger':
      return <BiErrorCircle className="w-6 h-6 text-red-500" />;
    case 'warning':
      return <AiOutlineWarning className="w-6 h-6 text-amber-500" />;
    case 'info':
      return <FiInfo className="w-6 h-6 text-blue-500" />;
    default:
      return <FiList className="w-6 h-6 text-gray-600" />;
  }
};

export default function StatCard({ item }: { item: StatItem }) {
  const tone = item.tone ?? 'neutral';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 flex items-center justify-between transition hover:shadow-sm">
      <div>
        <div className="text-sm text-gray-500">{item.label}</div>
        <div className={`mt-1 text-2xl font-semibold ${toneMap[tone]}`}>{item.value}</div>
      </div>
      <div className="flex items-center justify-center">{iconMap(tone)}</div>
    </div>
  );
}
