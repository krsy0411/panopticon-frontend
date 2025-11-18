'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiCalendar, FiChevronDown } from 'react-icons/fi';
import { TimeRange } from '@/types/time';
import { toast } from 'react-toastify';
import { PRESET_RANGES } from '@/src/constants/timeRanges';

// 날짜 포맷팅 유틸리티
const formatDate = (date: Date) => {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/* ==================== 프리셋 드롭다운 컴포넌트 ==================== */
interface PresetDropdownProps {
  selectedRange: TimeRange;
  onSelectRange: (range: TimeRange) => void;
  onShowCalendar: () => void;
}

function PresetDropdown({ selectedRange, onSelectRange, onShowCalendar }: PresetDropdownProps) {
  return (
    <>
      {/* 프리셋 옵션 */}
      <div className="max-h-60 overflow-y-auto">
        {PRESET_RANGES.map((range) => (
          <button
            key={range.value}
            type="button"
            onClick={() => onSelectRange(range)}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
              selectedRange.value === range.value
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* 캘린더 선택 버튼 */}
      <div className="border-t border-gray-200 py-2">
        <button
          type="button"
          onClick={onShowCalendar}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
        >
          <FiCalendar className="w-4 h-4 text-gray-500" />
          <span>직접 선택</span>
        </button>
      </div>
    </>
  );
}

/* ==================== 캘린더 컴포넌트 ==================== */
interface CalendarPickerProps {
  onApply: (startDate: string, endDate: string) => void;
  onBack: () => void;
}

function CalendarPicker({ onApply, onBack }: CalendarPickerProps) {
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const handleApply = () => {
    if (!customStartDate || !customEndDate) {
      toast.error('시작일과 종료일을 모두 선택해주세요.');
      return;
    }

    const start = new Date(customStartDate);
    const end = new Date(customEndDate);

    if (start > end) {
      toast.error('시작일은 종료일보다 이전이어야 합니다.');
      return;
    }

    onApply(customStartDate, customEndDate);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">기간 선택</h4>
        <button
          type="button"
          onClick={onBack}
          className="text-xs p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition"
        >
          ← 뒤로
        </button>
      </div>

      {/* 시작일 */}
      <div className="mb-3">
        <label className="block text-xs text-gray-600 mb-1">시작일</label>
        <input
          type="date"
          value={customStartDate}
          onChange={(e) => setCustomStartDate(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
        />
      </div>

      {/* 종료일 */}
      <div className="mb-3">
        <label className="block text-xs text-gray-600 mb-1">종료일</label>
        <input
          type="date"
          value={customEndDate}
          onChange={(e) => setCustomEndDate(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
        />
      </div>

      {/* 적용 버튼 */}
      <button
        type="button"
        onClick={handleApply}
        className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
      >
        적용
      </button>
    </div>
  );
}

/* ==================== 메인 SelectDate 컴포넌트 ==================== */
interface SelectDateProps {
  value?: TimeRange;
  onChange?: (range: TimeRange) => void;
  className?: string;
}

export const SelectDate = ({ value, onChange, className }: SelectDateProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedRange, setSelectedRange] = useState<TimeRange>(value || PRESET_RANGES[0]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 프리셋 범위 선택
  const handlePresetSelect = (range: TimeRange) => {
    setSelectedRange(range);
    setShowCalendar(false);
    setIsOpen(false);
    onChange?.(range);
  };

  // 캘린더 선택 모드로 전환
  const handleShowCalendar = () => {
    setShowCalendar(true);
  };

  // 캘린더에서 뒤로가기
  const handleBackToPreset = () => {
    setShowCalendar(false);
  };

  // 커스텀 날짜 적용
  const handleCustomDateApply = (startDateStr: string, endDateStr: string) => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    const customRange: TimeRange = {
      label: `${formatDate(start)} ~ ${formatDate(end)}`,
      value: 'custom',
      startDate: start,
      endDate: end,
    };

    setSelectedRange(customRange);
    setShowCalendar(false);
    setIsOpen(false);
    onChange?.(customRange);
  };

  return (
    <div ref={dropdownRef} className={`relative w-48 ${className ?? ''}`}>
      {/* 선택된 범위 표시 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm text-gray-700 w-56"
        style={{ minHeight: '40px' }}
      >
        <FiClock className="w-4 h-4 text-gray-500" />
        <span className="flex-1 truncate">{selectedRange.label}</span>
        <FiChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 드롭다운 메뉴 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-56"
          >
            {!showCalendar ? (
              <PresetDropdown
                selectedRange={selectedRange}
                onSelectRange={handlePresetSelect}
                onShowCalendar={handleShowCalendar}
              />
            ) : (
              <CalendarPicker onApply={handleCustomDateApply} onBack={handleBackToPreset} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
