'use client';

import { HiCube, HiArrowTrendingUp, HiExclamationTriangle } from 'react-icons/hi2';
import type { ApplicationSummary } from './types';

function DiffBadge({ diff }: { diff: number }) {
  if (diff === 0) {
    return <span className="text-gray-500 text-xs">(0)</span>;
  }

  const isUp = diff > 0;

  return (
    <span className={`text-xs font-semibold ml-1 ${isUp ? 'text-red-600' : 'text-emerald-600'}`}>
      ({isUp ? `+${diff}` : diff})
    </span>
  );
}

export function AppCard({ app }: { app: ApplicationSummary }) {
  return (
    <article
      className="
        group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6
        hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-[3px]
        hover:border-blue-300 transition-all min-h-[340px]
      "
    >
      {/* 헤더 */}
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition">
            {app.name}
          </h3>

          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            <HiCube className="h-4 w-4" />
            {app.serviceCount}
          </span>
        </div>

        {app.description && (
          <p className="text-sm text-slate-500 line-clamp-1">{app.description}</p>
        )}
      </header>

      {/* 메트릭 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* 에러 수 */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
          <p className="flex items-center gap-1 text-xs font-medium text-slate-500 mb-1">
            <HiExclamationTriangle className="h-4 w-4" />
            에러 수
          </p>
          <p className="text-lg font-bold text-slate-900 flex items-center">
            {(app.errorCount ?? 0).toLocaleString()}
            <DiffBadge diff={app.errorDiff ?? 0} />
          </p>
        </div>

        {/* 요청 수 */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
          <p className="flex items-center gap-1 text-xs font-medium text-slate-500 mb-1">
            <HiArrowTrendingUp className="h-4 w-4" />총 요청 수
          </p>
          <p className="text-lg font-bold text-slate-900 flex items-center">
            {(app.requestCount ?? 0).toLocaleString()}
            <DiffBadge diff={app.requestDiff ?? 0} />
          </p>
        </div>
      </div>

      {/* 생성일 */}
      <footer className="flex justify-between text-xs text-slate-500 border-t pt-4 border-slate-200">
        <span>생성일: {app.createdAt}</span>
      </footer>
    </article>
  );
}
