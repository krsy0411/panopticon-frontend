import type { TimeRangeKey, TimeRangeOption } from '@/src/types/notification';

interface TimeRangeTabsProps {
  options: TimeRangeOption[]; // 탭 옵션 배열
  value: TimeRangeKey; // 현재 선택된 키
  onChange: (key: TimeRangeKey) => void; // 선택 변경 콜백
}

export function TimeRangeTabs({ options, value, onChange }: TimeRangeTabsProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 p-1 text-sm font-semibold">
      {options.map((option) => {
        const active = option.key === value;
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={`px-3 py-1.5 rounded-full transition-all duration-150 ${
              active
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
