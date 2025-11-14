'use client';

import { IoClose } from 'react-icons/io5';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTraceById } from '@/src/api/apm';
import StateHandler from '@/components/ui/StateHandler';
import FlameGraph from './FlameGraph';
import WaterfallChart from './WaterfallChart';
import SelectedSpanDetails from './SelectedSpanDetails';

/**
 * Trace Analysis Component : Slide-over Panel 방식(모달 X)
 */
interface TraceAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  traceId: string;
}

type ViewMode = 'flamegraph' | 'waterfall';

export default function TraceAnalysis({ isOpen, onClose, traceId }: TraceAnalysisProps) {
  // traceId를 key로 사용하여 상태 초기화
  const [viewMode, setViewMode] = useState<ViewMode>('flamegraph');
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null);

  // Trace 데이터 가져오기
  const { data, isLoading, isError } = useQuery({
    queryKey: ['trace', traceId],
    queryFn: () => getTraceById(traceId),
    enabled: isOpen && !!traceId,
  });

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // 패널이 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Root span 찾기 (parent_span_id가 null인 스팬)
  const rootSpan = data?.spans.find((span) => span.parent_span_id === null);

  // Status에 따른 색상 결정
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'OK':
        return 'text-green-600 bg-green-50';
      case 'ERROR':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40 transition-opacity duration-300 opacity-100"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Panel */}
      <div className="fixed top-0 right-0 h-full w-[70%] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out translate-x-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {rootSpan?.name || 'Trace Analysis'}
              </h2>
              {rootSpan?.status && (
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(
                    rootSpan.status,
                  )}`}
                >
                  {rootSpan.status}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span className="font-medium">트레이스 ID:</span>
                <span className="font-mono text-xs">{traceId}</span>
              </div>
              {rootSpan?.service_name && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">서비스명:</span>
                  <span>{rootSpan.service_name}</span>
                </div>
              )}
              {rootSpan?.duration_ms !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">소요 시간:</span>
                  <span className="font-mono">{rootSpan.duration_ms.toFixed(2)}ms</span>
                </div>
              )}
              {rootSpan?.environment && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">환경:</span>
                  <span className="px-1.5 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">
                    {rootSpan.environment}
                  </span>
                </div>
              )}
              {rootSpan?.kind && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">종류:</span>
                  <span className="text-xs">{rootSpan.kind}</span>
                </div>
              )}
            </div>
            {(rootSpan?.http_method || rootSpan?.http_path) && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                {rootSpan.http_method && (
                  <span className="px-1.5 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 rounded">
                    {rootSpan.http_method}
                  </span>
                )}
                {rootSpan.http_path && <span className="font-mono">{rootSpan.http_path}</span>}
                {rootSpan.http_status_code && (
                  <span
                    className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                      rootSpan.http_status_code >= 500
                        ? 'bg-red-50 text-red-700'
                        : rootSpan.http_status_code >= 400
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {rootSpan.http_status_code}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
            aria-label="Close panel"
          >
            <IoClose className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors hover:cursor-pointer ${
              viewMode === 'flamegraph'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setViewMode('flamegraph')}
          >
            Flame Graph
          </button>
          <button
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors hover:cursor-pointer ${
              viewMode === 'waterfall'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setViewMode('waterfall')}
          >
            Waterfall
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-129px)] overflow-y-scroll">
          <StateHandler
            isLoading={isLoading}
            isError={isError}
            isEmpty={!data?.spans || data.spans.length === 0}
            type="chart"
            loadingMessage="트레이스 데이터를 불러오는 중..."
            errorMessage="트레이스 데이터를 불러올 수 없습니다"
            emptyMessage="트레이스에 스팬 데이터가 없습니다"
          >
            <div className="p-6 space-y-6">
              {/* Charts */}
              {viewMode === 'flamegraph' ? (
                <FlameGraph spans={data?.spans || []} onSpanSelect={setSelectedSpanId} />
              ) : (
                <WaterfallChart spans={data?.spans || []} onSpanSelect={setSelectedSpanId} />
              )}

              {/* Selected Span Details */}
              {selectedSpanId && data && (
                <SelectedSpanDetails
                  spanId={selectedSpanId}
                  spans={data.spans}
                  logs={data.logs}
                  onClose={() => setSelectedSpanId(null)}
                />
              )}
            </div>
          </StateHandler>
        </div>
      </div>
    </>
  );
}
