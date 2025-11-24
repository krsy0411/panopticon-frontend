'use client';

import { useState, useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import PullUpPanelLayout from '@/components/ui/PullUpPanelLayout';
import { LogEntry, LogLevel } from '@/types/apm';
import LevelBadge from '@/components/features/services/[serviceName]/logs/LevelBadge';
import { FiClock, FiTag, FiLink } from 'react-icons/fi';
import { useOverlayStack } from '@/components/ui/OverlayStackContext';

interface GroupShape {
  key: string;
  title: string;
  items: LogEntry[];
}

interface Props {
  isOpen: boolean;
  group: GroupShape | null;
  onClose: () => void;
}

export default function LogGroupPanel({ isOpen, group, onClose }: Props) {
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const overlayStack = useOverlayStack();
  const idRef = useRef<string | null>(null);

  // Register/unregister with overlay stack for ESC key handling
  useEffect(() => {
    const id =
      idRef.current ??
      `log-group-panel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    idRef.current = id;

    if (isOpen) {
      if (overlayStack?.register) {
        overlayStack.register(id, onClose);
        return () => overlayStack.unregister(id);
      }

      // Fallback: if no overlayStack provider, keep per-instance ESC handling
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }

    // if not open, ensure unregistered
    if (overlayStack) overlayStack.unregister(id);
    return;
  }, [isOpen, overlayStack, onClose]);

  if (!isOpen || !group) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 min-h-screen bg-black/10 backdrop-blur-[2px] z-50 transition-opacity duration-300 opacity-100"
        style={{ bottom: '0px' }}
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed top-0 right-0 h-full bg-white shadow-2xl z-60 transform transition-transform duration-300 ease-in-out translate-x-0 w-[85%] md:w-[75%] lg:w-[65%]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{group.title}</h2>
            <div className="text-sm text-gray-600 mt-1">{group.items.length}개 메시지</div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
            aria-label="Close panel"
          >
            <IoClose className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 relative h-[calc(100%-73px)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto">
            {group.items.map((it, idx) => (
              <div
                key={`${it.service}-${it.timestamp}-${idx}`}
                onClick={() => {
                  setSelectedLog({
                    id: `${it.service}-${it.timestamp}-${idx}`,
                    level: it.level as LogLevel,
                    service: it.service || '',
                    traceId: it.traceId || '',
                    message: it.message,
                    timestamp: it.timestamp,
                  });
                }}
                className="flex flex-col min-w-0 border-b border-gray-200 bg-white p-3 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-gray-600 font-mono flex-1 min-w-0 truncate">
                    {it.service || '—'}
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${
                      (it.level || '').toUpperCase() === 'ERROR'
                        ? 'bg-red-100 text-red-700'
                        : (it.level || '').toUpperCase() === 'WARN' ||
                          (it.level || '').toUpperCase() === 'WARNING'
                        ? 'bg-amber-100 text-amber-700'
                        : (it.level || '').toUpperCase() === 'DEBUG'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {it.level || 'INFO'}
                  </span>
                </div>

                <div className="mt-2 text-sm text-gray-800 truncate min-w-0">{it.message}</div>

                <div className="mt-1 text-xs text-gray-400 truncate max-w-40">
                  {(() => {
                    const day = new Date(it.timestamp as unknown as string);
                    if (isNaN(day.getTime())) return String(it.timestamp);
                    return day.toLocaleString();
                  })()}
                </div>
              </div>
            ))}
          </div>

          {selectedLog && (
            <PullUpPanelLayout defaultHeight={400} minHeight={250} maxHeight={600}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 sticky top-0 bg-white">
                <h2 className="text-lg font-semibold text-gray-900">로그 상세</h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors hover:cursor-pointer"
                  aria-label="닫기"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto p-4 md:p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    {/* Log Level */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-500 mb-2">레벨</label>
                      <LevelBadge level={selectedLog.level} />
                    </div>

                    {/* Timestamp */}
                    <div className="mb-6">
                      <label className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <FiClock className="w-4 h-4" />
                        타임스탬프
                      </label>
                      <div className="text-gray-900 font-mono text-sm bg-gray-50 p-3 rounded-lg">
                        {selectedLog.timestamp}
                      </div>
                    </div>

                    {/* Service */}
                    <div className="mb-6">
                      <label className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <FiTag className="w-4 h-4" />
                        서비스
                      </label>
                      <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {selectedLog.service}
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Trace ID */}
                    {selectedLog.traceId && (
                      <div className="mb-6">
                        <label className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                          <FiLink className="w-4 h-4" />
                          Trace ID
                        </label>
                        <div className="text-gray-900 font-mono text-sm bg-gray-50 p-3 rounded-lg break-all">
                          {selectedLog.traceId}
                        </div>
                      </div>
                    )}

                    {/* Log ID */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        로그 ID
                      </label>
                      <div className="text-gray-600 font-mono text-xs bg-gray-50 p-3 rounded-lg break-all">
                        {selectedLog.id}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message - Full width */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-500 mb-2">메시지</label>
                  <div className="text-gray-900 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap wrap-break-word">
                    {selectedLog.message}
                  </div>
                </div>
              </div>
            </PullUpPanelLayout>
          )}
        </div>
      </div>
    </>
  );
}
