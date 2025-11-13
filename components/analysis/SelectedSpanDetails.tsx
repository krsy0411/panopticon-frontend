'use client';

import { SpanItem, LogItem } from '@/types/apm';
import { useMemo } from 'react';
import { IoClose } from 'react-icons/io5';

interface SelectedSpanDetailsProps {
  spanId: string;
  spans: SpanItem[];
  logs: LogItem[];
  onClose: () => void;
}

// Status에 따른 색상
const getStatusColor = (status: string) => {
  switch (status) {
    case 'OK':
      return 'text-green-600 bg-green-50';
    case 'ERROR':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// Kind에 따른 색상
const getKindColor = (kind: string) => {
  switch (kind) {
    case 'SERVER':
      return 'text-blue-600 bg-blue-50';
    case 'CLIENT':
      return 'text-green-600 bg-green-50';
    case 'INTERNAL':
      return 'text-purple-600 bg-purple-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// Log Level에 따른 색상
const getLogLevelColor = (level: string) => {
  switch (level) {
    case 'ERROR':
      return 'text-red-600 bg-red-50';
    case 'WARN':
      return 'text-yellow-600 bg-yellow-50';
    case 'INFO':
      return 'text-blue-600 bg-blue-50';
    case 'DEBUG':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export default function SelectedSpanDetails({
  spanId,
  spans,
  logs,
  onClose,
}: SelectedSpanDetailsProps) {
  // 선택된 스팬 찾기
  const selectedSpan = useMemo(() => {
    return spans.find((span) => span.span_id === spanId);
  }, [spans, spanId]);

  // 선택된 스팬과 관련된 로그 필터링
  const relatedLogs = useMemo(() => {
    return logs.filter((log) => log.span_id === spanId);
  }, [logs, spanId]);

  if (!selectedSpan) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">선택된 Span 상세 정보</h3>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors hover:cursor-pointer"
          aria-label="Close details"
        >
          <IoClose className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Span 기본 정보 */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">기본 정보</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Span 이름</span>
              <p className="text-sm font-medium text-gray-900 mt-1">{selectedSpan.name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">서비스명</span>
              <p className="text-sm font-medium text-gray-900 mt-1">{selectedSpan.service_name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Span ID</span>
              <p className="text-xs font-mono text-gray-900 mt-1">{selectedSpan.span_id}</p>
            </div>
            {selectedSpan.parent_span_id && (
              <div>
                <span className="text-sm text-gray-500">부모 Span ID</span>
                <p className="text-xs font-mono text-gray-900 mt-1">
                  {selectedSpan.parent_span_id}
                </p>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-500">소요 시간</span>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {selectedSpan.duration_ms.toFixed(2)}ms
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">타임스탬프</span>
              <p className="text-xs font-mono text-gray-900 mt-1">
                {new Date(selectedSpan.timestamp).toLocaleString('ko-KR')}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">상태</span>
              <p className="mt-1">
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                    selectedSpan.status,
                  )}`}
                >
                  {selectedSpan.status}
                </span>
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">종류</span>
              <p className="mt-1">
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded ${getKindColor(
                    selectedSpan.kind,
                  )}`}
                >
                  {selectedSpan.kind}
                </span>
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">환경</span>
              <p className="text-sm font-medium text-gray-900 mt-1">{selectedSpan.environment}</p>
            </div>
          </div>
        </div>

        {/* HTTP 정보 */}
        {(selectedSpan.http_method || selectedSpan.http_path || selectedSpan.http_status_code) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">HTTP 정보</h4>
            <div className="grid grid-cols-2 gap-4">
              {selectedSpan.http_method && (
                <div>
                  <span className="text-sm text-gray-500">메서드</span>
                  <p className="mt-1">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded">
                      {selectedSpan.http_method}
                    </span>
                  </p>
                </div>
              )}
              {selectedSpan.http_path && (
                <div>
                  <span className="text-sm text-gray-500">경로</span>
                  <p className="text-sm font-mono text-gray-900 mt-1">{selectedSpan.http_path}</p>
                </div>
              )}
              {selectedSpan.http_status_code && (
                <div>
                  <span className="text-sm text-gray-500">상태 코드</span>
                  <p className="mt-1">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                        selectedSpan.http_status_code >= 500
                          ? 'bg-red-50 text-red-700'
                          : selectedSpan.http_status_code >= 400
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {selectedSpan.http_status_code}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DB 정보 */}
        {selectedSpan.db_statement && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">데이터베이스 정보</h4>
            <div>
              <span className="text-sm text-gray-500">쿼리문</span>
              <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs font-mono text-gray-900 overflow-x-auto">
                {selectedSpan.db_statement}
              </pre>
            </div>
          </div>
        )}

        {/* Labels */}
        {selectedSpan.labels && Object.keys(selectedSpan.labels).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">레이블</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(selectedSpan.labels).map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
                >
                  <span className="font-medium text-gray-700">{key}:</span>
                  <span className="text-gray-600">{value}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 관련 로그 */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            관련 로그 ({relatedLogs.length})
          </h4>
          {relatedLogs.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {relatedLogs.map((log, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded ${getLogLevelColor(
                        log.level,
                      )}`}
                    >
                      {log.level}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 wrap-break-word">{log.message}</p>
                  {log.labels && Object.keys(log.labels).length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-200">
                      {Object.entries(log.labels).map(([key, value]) => (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white rounded text-xs"
                        >
                          <span className="font-medium text-gray-600">{key}:</span>
                          <span className="text-gray-500">{value}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-gray-500 bg-gray-50 rounded-lg">
              이 스팬과 관련된 로그가 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
