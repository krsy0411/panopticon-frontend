// 상단의 검색창 + 드롭다운 필터 UI

'use client';

import React from 'react';
import SearchInput from '@/components/ui/SearchInput';

type Props = {
  query: string;
  level: string;
  service: string;
  levels: string[];
  services: string[];
  onChangeQuery: (v: string) => void;
  onChangeLevel: (v: string) => void;
  onChangeService: (v: string) => void;
};

export default function FilterBar({
  query,
  level,
  service,
  levels,
  services,
  onChangeQuery,
  onChangeLevel,
  onChangeService,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 md:p-4 flex flex-col gap-3 md:flex-row md:items-center">
      {/* 검색창 */}
      <div className="flex-1">
        <SearchInput
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeQuery(e.target.value)}
          placeholder="Search"
        />
      </div>
      {/* 로그 레벨 선택 */}
      <select
        className="h-11 rounded-xl bg-gray-100 px-4 text-sm"
        value={level}
        onChange={(e) => onChangeLevel(e.target.value)}
      >
        {levels.map((l) => (
          <option key={l} value={l}>
            {l === '' ? '모든 레벨' : l}
          </option>
        ))}
      </select>
      {/* 서비스 선택 */}
      <select
        className="h-11 rounded-xl bg-gray-100 px-4 text-sm"
        value={service}
        onChange={(e) => onChangeService(e.target.value)}
      >
        {services.map((s) => (
          <option key={s} value={s}>
            {s === '' ? '모든 서비스' : s}
          </option>
        ))}
      </select>
    </div>
  );
}
