// 에러 로그 목록 => 로그 목록 전체 + 상태 관리

import type { LogEntry } from '@/types/apm';
import LogItem from './LogItem';

interface LogListProps {
  items: LogEntry[];
  onItemClick?: (log: LogEntry) => void;
}

export default function LogList({ items, onItemClick }: LogListProps) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((l) => (
        <LogItem key={l.id} item={l} onClick={onItemClick} />
      ))}
    </div>
  );
}
