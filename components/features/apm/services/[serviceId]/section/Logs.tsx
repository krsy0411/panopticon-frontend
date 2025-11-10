'use client';

import { useMemo, useState } from 'react';
import { mockLogs, mockStats } from '../logs/mock';
import FilterBar from '../logs/FilterBar';
import StatGrid from '../logs/StatGrid';
import LogList from '../logs/LogList';

export default function LogsSection() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('');
  const [service, setService] = useState('');

  const services = useMemo(() => ['', ...Array.from(new Set(mockLogs.map((l) => l.service)))], []);
  const levels = ['', 'ERROR', 'WARNING', 'INFO'];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mockLogs.filter((l) => {
      const matchQuery =
        q === '' ||
        l.message.toLowerCase().includes(q) ||
        l.service.toLowerCase().includes(q) ||
        l.traceId.toLowerCase().includes(q);
      const matchLevel = level === '' || l.level === level;
      const matchService = service === '' || l.service === service;
      return matchQuery && matchLevel && matchService;
    });
  }, [query, level, service]);

  return (
    <section id="logs" className="flex flex-col gap-4 md:gap-6 scroll-mt-24">
      <FilterBar
        query={query}
        level={level}
        service={service}
        levels={levels}
        services={services}
        onChangeQuery={setQuery}
        onChangeLevel={setLevel}
        onChangeService={setService}
      />
      <StatGrid items={mockStats} />
      <LogList items={filtered} />
    </section>
  );
}
