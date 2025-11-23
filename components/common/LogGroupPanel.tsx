'use client';

import { useState } from 'react';
import SlideOverLayout from '@/components/ui/SlideOverLayout';
import { IoClose } from 'react-icons/io5';
import LogAnalysis from '@/components/analysis/LogAnalysis';
import { LogEntry, LogLevel } from '@/types/apm';

interface GroupShape {
  key: string;
  title: string;
  items: LogEntry[];
}

interface Props {
  isOpen: boolean;
  group: GroupShape | null;
  onClose: () => void;
  widthClass?: string;
}

export default function LogGroupPanel({ isOpen, group, onClose, widthClass = 'w-[65%]' }: Props) {
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  if (!group) return null;

  return (
    <>
      <SlideOverLayout
        isOpen={isOpen}
        onClose={onClose}
        widthClass={widthClass}
        enableEsc={!isAnalysisOpen}
        backdropClassName={
          isAnalysisOpen
            ? 'fixed inset-0 bg-black/5 backdrop-blur-sm z-20 transition-opacity duration-300 opacity-100'
            : 'fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40 transition-opacity duration-300 opacity-100'
        }
        panelClassName={
          isAnalysisOpen
            ? 'fixed top-0 right-0 h-full bg-white shadow-2xl z-30 transform transition-transform duration-300 ease-in-out translate-x-0 filter blur-sm'
            : 'fixed top-0 right-0 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out translate-x-0'
        }
      >
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

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                  setIsAnalysisOpen(true);
                }}
                className="flex flex-col justify-between min-w-0 border-b border-gray-200 bg-white p-3 hover:bg-gray-50 transition-colors cursor-pointer"
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
        </div>
      </SlideOverLayout>

      <LogAnalysis
        log={selectedLog}
        isOpen={isAnalysisOpen}
        onClose={() => {
          setIsAnalysisOpen(false);
        }}
      />
    </>
  );
}
