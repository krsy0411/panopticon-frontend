/// 에러 로그 1개 => UI 스타일만 담당

import type { LogEntry } from '@/types/apm';
import LevelBadge from './LevelBadge';

interface LogItemProps {
  item: LogEntry;
  onClick?: (log: LogEntry) => void;
}

export default function LogItem({ item, onClick }: LogItemProps) {
  return (
    <div
      className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 flex flex-col md:flex-row md:items-start md:justify-between hover:shadow-sm transition cursor-pointer"
      onClick={() => onClick?.(item)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <LevelBadge level={item.level} />
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
            {item.service}
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500 truncate max-w-[200px]">
            {item.traceId}
          </span>
        </div>
        <div className="mt-2 text-gray-900 font-medium wrap-break-word">{item.message}</div>
      </div>
      <div className="mt-3 md:mt-0 md:ml-4 md:shrink-0 text-left md:text-right text-sm text-gray-500 flex items-center gap-2">
        <span>🕒</span>
        <span className="tabular-nums">{item.timestamp}</span>
        <span className="text-gray-400">›</span>
      </div>
    </div>
  );
}
