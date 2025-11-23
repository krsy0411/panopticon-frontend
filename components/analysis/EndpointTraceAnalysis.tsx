'use client';

import { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { useQuery } from '@tanstack/react-query';
import { getEndpointTraces } from '@/src/api/apm';
import { TraceStatusFilter, EndpointTraceItem } from '@/types/apm';
import { useTimeRangeStore } from '@/src/store/timeRangeStore';
import StateHandler from '@/components/ui/StateHandler';
import Dropdown from '@/components/ui/Dropdown';
import TraceAnalysis from './TraceAnalysis';
import SlideOverLayout from '@/components/ui/SlideOverLayout';

/**
 * Trace Card Component
 */
interface TraceCardProps {
  trace: EndpointTraceItem;
  onClick: () => void;
}

function TraceCard({ trace, onClick }: TraceCardProps) {
  return (
    <div
      onClick={onClick}
      className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer h-full flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-md ${
              trace.status === 'ERROR' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {trace.status}
          </span>
          <span className="text-xs text-gray-500">{trace.serviceName}</span>
        </div>
      </div>
      <div className="flex-1 space-y-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Trace ID</p>
          <p className="font-mono text-xs text-gray-900 break-all line-clamp-2">{trace.traceId}</p>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1">Duration</p>
            <p className="font-mono text-sm font-semibold text-gray-900">
              {trace.durationMs >= 1000
                ? `${(trace.durationMs / 1000).toFixed(2)}s`
                : `${trace.durationMs.toFixed(2)}ms`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Time</p>
            <p className="text-xs text-gray-700">
              {new Date(trace.timestamp).toLocaleTimeString('ko-KR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Endpoint Trace Analysis Component
 * 엔드포인트의 에러/느린 트레이스 목록을 보여주는 SlideOverPanel
 */
interface EndpointTraceAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  endpointName: string;
}

export default function EndpointTraceAnalysis({
  isOpen,
  onClose,
  serviceName,
  endpointName,
}: EndpointTraceAnalysisProps) {
  // 상태 관리
  const [status, setStatus] = useState<TraceStatusFilter>('ERROR');
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const { startTime, endTime } = useTimeRangeStore();

  // 트레이스 데이터 가져오기
  const {
    data: rawData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['endpointTraces', serviceName, endpointName, status, startTime, endTime],
    queryFn: () =>
      getEndpointTraces(serviceName, endpointName, {
        status,
        from: startTime,
        to: endTime,
        limit: 20,
      }),
    enabled: isOpen && !!serviceName && !!endpointName,
  });

  // durationMs 기준 내림차순 정렬 (큰 값이 앞에 오도록)
  const data = rawData ? [...rawData].sort((a, b) => b.durationMs - a.durationMs) : rawData;

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !selectedTraceId) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, selectedTraceId]);

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

  // Status 드롭다운 옵션
  const statusOptions = [
    { label: '에러 (최신순)', value: 'ERROR' as const },
    { label: '느린순', value: 'SLOW' as const },
  ];

  // 트레이스 클릭 핸들러
  const handleTraceClick = (trace: EndpointTraceItem) => {
    setSelectedTraceId(trace.traceId);
  };

  // TraceAnalysis 닫기 핸들러
  const handleTraceAnalysisClose = () => {
    setSelectedTraceId(null);
  };

  const widthClass = 'w-[70%]';
  const backdropClassName =
    'fixed inset-0 bg-black/10 backdrop-blur-[2px] z-60 transition-opacity duration-300 opacity-100';
  const panelClassName =
    'fixed top-0 right-0 h-full bg-white shadow-2xl z-70 transform transition-transform duration-300 ease-in-out translate-x-0';

  return (
    <>
      <SlideOverLayout
        isOpen={isOpen}
        onClose={onClose}
        widthClass={widthClass}
        backdropClassName={backdropClassName}
        panelClassName={panelClassName}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">엔드포인트 추적</h2>
            <p className="text-sm text-gray-600 font-mono">{endpointName}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Status Dropdown */}
            <div className="w-32">
              <Dropdown value={status} onChange={setStatus} options={statusOptions} />
            </div>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
              aria-label="Close panel"
            >
              <IoClose className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-73px)] overflow-y-auto">
          <StateHandler
            isLoading={isLoading}
            isError={isError}
            isEmpty={!data || data.length === 0}
            type="table"
            height={400}
            loadingMessage="트레이스 목록을 불러오는 중..."
            errorMessage="트레이스 목록을 불러올 수 없습니다"
            emptyMessage={`${status === 'ERROR' ? '에러' : '느린'} 트레이스가 없습니다`}
          >
            <div className="p-6">
              {/* Trace Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.map((trace) => (
                  <TraceCard
                    key={trace.traceId}
                    trace={trace}
                    onClick={() => handleTraceClick(trace)}
                  />
                ))}
              </div>
            </div>
          </StateHandler>
        </div>
      </SlideOverLayout>

      {/* TraceAnalysis (선택된 트레이스가 있을 때) */}
      {selectedTraceId && (
        <TraceAnalysis
          key={selectedTraceId}
          isOpen={!!selectedTraceId}
          onClose={handleTraceAnalysisClose}
          traceId={selectedTraceId}
        />
      )}
    </>
  );
}
