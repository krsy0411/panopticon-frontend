// 에러 로그 목록 => 로그 목록 전체 + 상태 관리

import type { LogEntry } from '@/types/apm';
import LogItem from './LogItem';

export default function LogList({ items }: { items: LogEntry[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((l) => (
        <LogItem key={l.id} item={l} />
      ))}
    </div>
  );
}
