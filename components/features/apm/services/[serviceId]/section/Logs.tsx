'use client';

import { useMemo, useState } from 'react';
import FilterBar from '../logs/FilterBar';
import StatGrid from '../../../../../ui/StatGrid';
import LogList from '../logs/LogList';
import { useQuery } from '@tanstack/react-query';
import { getLogs } from '@/src/api/apm';
import { LogLevel } from '@/types/apm';

interface LogsSectionProps {
  serviceName: string;
}

export default function LogsSection({ serviceName }: LogsSectionProps) {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<LogLevel | ''>('');
  const [service, setService] = useState('');

  // 로그 목록 가져오기 (새 API)
  const { data: logsData } = useQuery({
    queryKey: ['logs', serviceName, level],
    queryFn: () =>
      getLogs({
        service_name: serviceName,
        level: level || undefined,
        size: 100,
      }),
  });

  // 로그 데이터 변환
  const logs = useMemo(() => {
    if (!logsData?.items) return [];
    return logsData.items.map((log) => ({
      id: `${log.service_name}-${log.timestamp}`,
      level: log.level as LogLevel,
      service: log.service_name,
      traceId: log.trace_id || '',
      message: log.message,
      timestamp: new Date(log.timestamp).toLocaleString('ko-KR'),
    }));
  }, [logsData]);

  const stats = useMemo(() => {
    if (!logsData) return [];

    // TODO: 백엔드에서 level_counts 필드를 제공하면 아래 코드로 교체
    // const errorCount = logsData.level_counts?.ERROR ?? 0;
    // const warnCount = logsData.level_counts?.WARN ?? 0;
    // const infoCount = logsData.level_counts?.INFO ?? 0;
    //
    // 현재는 페이지네이션된 100개 로그만으로 계산하므로 정확하지 않음
    const errorCount = logs.filter((l) => l.level === 'ERROR').length;
    const warnCount = logs.filter((l) => l.level === 'WARN').length;
    const infoCount = logs.filter((l) => l.level === 'INFO').length;

    return [
      { id: 'total', label: '총 로그', value: logsData.total, tone: 'neutral' as const },
      { id: 'error', label: '에러', value: errorCount, tone: 'danger' as const },
      { id: 'warn', label: '경고', value: warnCount, tone: 'warning' as const },
      { id: 'info', label: '정보', value: infoCount, tone: 'info' as const },
    ];
  }, [logs, logsData]);

  const services: string[] = useMemo(() => {
    const serviceSet = new Set(logs.map((l: { service: string }) => l.service));
    return ['', ...Array.from(serviceSet)];
  }, [logs]);
  const levels = ['', 'ERROR', 'WARN', 'INFO', 'DEBUG'];

  const handleLevelChange = (v: string) => {
    setLevel(v as LogLevel | '');
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter(
      (l: { message: string; service: string; traceId: string; level: string }) => {
        const matchQuery =
          q === '' ||
          l.message.toLowerCase().includes(q) ||
          l.service.toLowerCase().includes(q) ||
          l.traceId.toLowerCase().includes(q);
        const matchLevel = level === '' || l.level.toLowerCase() === level.toLowerCase();
        const matchService = service === '' || l.service === service;
        return matchQuery && matchLevel && matchService;
      },
    );
  }, [query, level, service, logs]);

  return (
    <section id="logs" className="flex flex-col gap-4 md:gap-6 scroll-mt-24">
      <FilterBar
        query={query}
        level={level}
        service={service}
        levels={levels}
        services={services}
        onChangeQuery={setQuery}
        onChangeLevel={handleLevelChange}
        onChangeService={setService}
      />
      <StatGrid items={stats} />
      <LogList items={filtered} />
    </section>
  );
}
