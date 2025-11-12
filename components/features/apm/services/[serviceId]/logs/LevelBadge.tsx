// ERROR, WARNING, INFO 값에 따라 색상 + 아이콘 다르게 표시

import type { LogLevel } from '@/types/apm';
import { BiErrorCircle } from 'react-icons/bi';
import { AiOutlineWarning } from 'react-icons/ai';
import { FiInfo } from 'react-icons/fi';

export default function LevelBadge({ level }: { level: LogLevel }) {
  const { bg, text, Icon } =
    level === 'ERROR'
      ? { bg: 'bg-red-100', text: 'text-red-700', Icon: BiErrorCircle }
      : level === 'WARNING'
      ? { bg: 'bg-amber-100', text: 'text-amber-700', Icon: AiOutlineWarning }
      : { bg: 'bg-blue-100', text: 'text-blue-700', Icon: FiInfo };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${bg} ${text}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="capitalize">{level.toLowerCase()}</span>
    </span>
  );
}
