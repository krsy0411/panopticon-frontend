'use client';

import { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { useQuery } from '@tanstack/react-query';
import { getEndpointTraces } from '@/src/api/apm';
import { TraceStatusFilter, EndpointTraceItem } from '@/types/apm';
import { useTimeRangeStore, POLLING_INTERVAL } from '@/src/store/timeRangeStore';
import StateHandler from '@/components/ui/StateHandler';
import Dropdown from '@/components/ui/Dropdown';
import Table, { TableColumn } from '@/components/ui/Table';
import TraceAnalysis from './TraceAnalysis';
import SlideOverLayout from '@/components/ui/SlideOverLayout';

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

type SortOption = 'ERROR_SLOW' | 'ERROR_LATEST' | 'SLOW';

export default function EndpointTraceAnalysis({
  isOpen,
  onClose,
  serviceName,
  endpointName,
}: EndpointTraceAnalysisProps) {
  // 상태 관리
  const [sortOption, setSortOption] = useState<SortOption>('SLOW');
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const { startTime, endTime } = useTimeRangeStore();

  // sortOption에서 status 추출
  const status: TraceStatusFilter = sortOption === 'SLOW' ? 'SLOW' : 'ERROR';

  // 트레이스 데이터 가져오기 (3초마다 폴링)
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
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: true,
    staleTime: POLLING_INTERVAL - 500, // 약간의 여유를 두고 stale 처리
  });

  // sortOption에 따른 정렬
  const data = rawData
    ? [...rawData].sort((a, b) => {
        if (sortOption === 'ERROR_SLOW' || sortOption === 'SLOW') {
          // 느린순: durationMs 기준 내림차순
          return b.durationMs - a.durationMs;
        } else if (sortOption === 'ERROR_LATEST') {
          // 최신순: timestamp 기준 내림차순
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
        return 0;
      })
    : rawData;

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

  // 정렬 옵션
  const sortOptions = [
    { label: '느린순', value: 'SLOW' as const },
    { label: '에러(느린순)', value: 'ERROR_SLOW' as const },
    { label: '에러(최신순)', value: 'ERROR_LATEST' as const },
  ];

  // 트레이스 클릭 핸들러
  const handleTraceClick = (trace: EndpointTraceItem) => {
    setSelectedTraceId(trace.traceId);
  };

  // TraceAnalysis 닫기 핸들러
  const handleTraceAnalysisClose = () => {
    setSelectedTraceId(null);
  };

  // 테이블 컬럼 정의
  const columns: TableColumn<EndpointTraceItem>[] = [
    {
      key: 'status',
      header: 'Status',
      width: '12%',
      render: (status) => (
        <span
          className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${
            status === 'ERROR' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {status}
        </span>
      ),
      sortable: false,
    },
    {
      key: 'serviceName',
      header: 'Service',
      width: '15%',
      sortable: false,
    },
    {
      key: 'traceId',
      header: 'Trace ID',
      width: '35%',
      render: (traceId) => <span className="font-mono text-xs text-gray-600">{traceId}</span>,
      sortable: false,
    },
    {
      key: 'durationMs',
      header: 'Duration',
      width: '18%',
      render: (durationMs) => {
        const duration = typeof durationMs === 'number' ? durationMs : 0;
        return (
          <span className="font-mono">
            {duration >= 1000 ? `${(duration / 1000).toFixed(2)}s` : `${duration.toFixed(2)}ms`}
          </span>
        );
      },
      sortable: false,
    },
    {
      key: 'timestamp',
      header: 'Time',
      width: '20%',
      render: (timestamp) => <span>{new Date(timestamp).toLocaleString('ko-KR')}</span>,
      sortable: false,
    },
  ];

  const widthClass = 'w-[70%]';
  const backdropClassName =
    'fixed inset-0 min-h-screen bg-black/10 backdrop-blur-[2px] z-60 transition-opacity duration-300 opacity-100';
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
            {/* Sort Dropdown */}
            <div className="w-40">
              <Dropdown value={sortOption} onChange={setSortOption} options={sortOptions} />
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
              {/* Trace Table */}
              {data && (
                <Table
                  columns={columns}
                  data={data}
                  onRowClick={handleTraceClick}
                  className="w-full"
                />
              )}
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
