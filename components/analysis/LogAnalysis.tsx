'use client';
import { LogEntry } from '@/types/apm';
import { FiClock, FiTag, FiLink } from 'react-icons/fi';
import LevelBadge from '@/components/features/services/[serviceName]/logs/LevelBadge';
import PullUpPanelLayout from '@/components/ui/PullUpPanelLayout';

interface LogAnalysisProps {
  log: LogEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LogAnalysis({ log, isOpen, onClose }: LogAnalysisProps) {
  if (!log || !isOpen) return null;

  return (
    <PullUpPanelLayout defaultHeight={500} minHeight={300} maxHeight={800}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4 md:p-6 sticky top-0 bg-white">
        <h2 className="text-xl font-semibold text-gray-900">로그 상세</h2>
        <button
          onClick={onClose}
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
        {/* Log Level */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 mb-2">레벨</label>
          <LevelBadge level={log.level} />
        </div>

        {/* Timestamp */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
            <FiClock className="w-4 h-4" />
            타임스탬프
          </label>
          <div className="text-gray-900 font-mono text-sm bg-gray-50 p-3 rounded-lg">
            {log.timestamp}
          </div>
        </div>

        {/* Service */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
            <FiTag className="w-4 h-4" />
            서비스
          </label>
          <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{log.service}</div>
        </div>

        {/* Trace ID */}
        {log.traceId && (
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
              <FiLink className="w-4 h-4" />
              Trace ID
            </label>
            <div className="text-gray-900 font-mono text-sm bg-gray-50 p-3 rounded-lg break-all">
              {log.traceId}
            </div>
          </div>
        )}

        {/* Message */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 mb-2">메시지</label>
          <div className="text-gray-900 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap wrap-break-word">
            {log.message}
          </div>
        </div>

        {/* Log ID */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 mb-2">로그 ID</label>
          <div className="text-gray-600 font-mono text-xs bg-gray-50 p-3 rounded-lg break-all">
            {log.id}
          </div>
        </div>
      </div>
    </PullUpPanelLayout>
  );
}
