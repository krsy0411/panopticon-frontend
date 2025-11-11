'use client';

import { useMemo, useState } from 'react';
import FilterBar from '../logs/FilterBar';
import StatGrid from '../../../../../ui/StatGrid';
import LogList from '../logs/LogList';
import { useQuery } from '@tanstack/react-query';
import { getServiceLogs, getServiceLogStats } from '@/src/api/apm';
import { ServiceLog, LogLevel } from '@/types/apm';

interface LogsSectionProps {
  serviceName: string;
}

export default function LogsSection({ serviceName }: LogsSectionProps) {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<'error' | 'warning' | 'info' | ''>('');
  const [service, setService] = useState('');

  // 로그 통계 가져오기
  const { data: statsData } = useQuery({
    queryKey: ['serviceLogStats', serviceName],
    queryFn: () => getServiceLogStats(serviceName),
  });

  // 로그 목록 가져오기
  const { data: logsData } = useQuery({
    queryKey: ['serviceLogs', serviceName, level],
    queryFn: () => getServiceLogs(serviceName, level ? { level } : undefined),
  });

  // 통계 데이터 변환
  const stats = useMemo(() => {
    if (!statsData) return [];
    return [
      { id: 'total', label: '총 로그', value: statsData.total_logs, tone: 'neutral' as const },
      { id: 'error', label: '에러', value: statsData.error_count, tone: 'danger' as const },
      { id: 'warn', label: '경고', value: statsData.warning_count, tone: 'warning' as const },
      { id: 'info', label: '정보', value: statsData.info_count, tone: 'info' as const },
    ];
  }, [statsData]);

  // 로그 데이터 변환
  const logs = useMemo(() => {
    if (!logsData?.logs) return [];
    return logsData.logs.map((log: ServiceLog) => ({
      id: log.log_id,
      level: log.level.toUpperCase() as LogLevel,
      service: log.service,
      traceId: log.trace_id || '',
      message: log.message,
      timestamp: new Date(log.timestamp).toLocaleString('ko-KR'),
    }));
  }, [logsData]);

  const services: string[] = useMemo(() => {
    const serviceSet = new Set(logs.map((l: { service: string }) => l.service));
    return ['', ...Array.from(serviceSet)];
  }, [logs]);
  const levels = ['', 'ERROR', 'WARNING', 'INFO'];

  const handleLevelChange = (v: string) => {
    setLevel(v as '' | 'error' | 'warning' | 'info');
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
