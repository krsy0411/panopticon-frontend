/// 에러 로그 1개 => UI 스타일만 담당

import type { LogEntry } from '@/types/apm';
import LevelBadge from './LevelBadge';

export default function LogItem({ item }: { item: LogEntry }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 flex items-start justify-between hover:shadow-sm transition">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <LevelBadge level={item.level} />
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
            {item.service}
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
            {item.traceId}
          </span>
        </div>
        <div className="mt-2 text-gray-900 font-medium truncate">{item.message}</div>
      </div>
      <div className="ml-4 shrink-0 text-right text-sm text-gray-500 flex items-center gap-2">
        <span>🕒</span>
        <span className="tabular-nums">{item.timestamp}</span>
        <span className="text-gray-400">›</span>
      </div>
    </div>
  );
}
