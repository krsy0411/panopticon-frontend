import { AppCard } from './AppCard';
import type { ApplicationSummary } from './types';

interface AppListProps {
  apps: ApplicationSummary[];
}

export function AppList({ apps }: AppListProps) {
  return (
    <div>
      {/* 상단 라벨 */}
      <p className="mb-4 text-slate-600">
        총 <span className="font-semibold text-slate-900">{apps.length}</span>개의 애플리케이션
      </p>

      {/* 카드 그리드 */}
      <div className="grid gap-10 lg:grid-cols-3 md:grid-cols-2">
        {apps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
}
