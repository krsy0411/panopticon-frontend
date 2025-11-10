// 에러 카드를 모아서 보여줌 => 통계 데이터 묶음 + 레이아웃 담당

import type { StatItem } from './types';
import StatCard from './StatCard';

export default function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      {items.map((s) => (
        <StatCard key={s.id} item={s} />
      ))}
    </div>
  );
}
