'use client';

import { useState, useRef, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';
import { useAlarm } from '@/src/providers/AlarmProvider';

export const Alarm = () => {
  const { unreadCount, recentErrors, clearAlarm, resetUnreadCount } = useAlarm();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleClick = () => {
    clearAlarm();
    setIsDropdownOpen((prev) => !prev);

    // 드롭다운을 열 때 unreadCount 리셋
    if (!isDropdownOpen) {
      resetUnreadCount();
    }
  };

  const handleViewMore = () => {
    setIsDropdownOpen(false);

    // 에러 로그 섹션으로 스크롤
    const logsSection = document.getElementById('logs');
    if (logsSection) {
      logsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}시간 전`;
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
        aria-label="알림"
        onClick={handleClick}
      >
        <FiBell className="w-6 h-6 text-zinc-700" />

        {/* 읽지 않은 알림 배지 */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-bold rounded-full">
            {unreadCount > 999 ? '999+' : unreadCount}
          </span>
        )}
      </button>

      {/* 드롭다운 */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">최근 에러 로그</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {recentErrors.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FiBell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>새로운 에러 로그가 없습니다</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentErrors.map((error, index) => (
                  <li
                    key={`${error.service_name}-${error.timestamp}-${index}`}
                    className="p-4 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold text-red-600 bg-red-50">
                          ERROR
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {error.service_name}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{error.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimestamp(error.timestamp)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {recentErrors.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={handleViewMore}
                className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 py-2 rounded-md hover:bg-blue-50 transition"
              >
                더보기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
