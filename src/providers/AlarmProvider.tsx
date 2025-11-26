'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { useErrorLogsWebSocket } from '@/src/hooks/useErrorLogsWebSocket';
import { LogItem } from '@/types/apm';

interface AlarmContextValue {
  unreadCount: number;
  hasNewAlarm: boolean;
  recentErrors: LogItem[];
  clearAlarm: () => void;
  resetUnreadCount: () => void;
}

const AlarmContext = createContext<AlarmContextValue | undefined>(undefined);

const MAX_RECENT_ERRORS = 10;

export default function AlarmProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewAlarm, setHasNewAlarm] = useState(false);
  const [recentErrors, setRecentErrors] = useState<LogItem[]>([]);

  const handleLogReceived = useCallback((log: LogItem) => {
    // recentErrors 업데이트
    setRecentErrors((prev) => {
      const next = [log, ...prev].slice(0, MAX_RECENT_ERRORS);
      return next;
    });

    // unread 및 표시 상태
    setUnreadCount((c) => c + 1);
    setHasNewAlarm(true);
  }, []);

  // 전체 서비스 에러 수신 (serviceName 없이 전체 에러 로그 수신)
  useErrorLogsWebSocket({
    onLogReceived: handleLogReceived,
    enabled: true,
  });

  const clearAlarm = useCallback(() => {
    setHasNewAlarm(false);
  }, []);

  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return (
    <AlarmContext.Provider
      value={{ unreadCount, hasNewAlarm, recentErrors, clearAlarm, resetUnreadCount }}
    >
      {children}
    </AlarmContext.Provider>
  );
}

export function useAlarm() {
  const context = useContext(AlarmContext);
  if (context === undefined) {
    throw new Error('useAlarm must be used within an AlarmProvider');
  }
  return context;
}
