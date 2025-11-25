// 검색, 시간, 페이지 사이즈

'use client';

import SearchInput from '@/components/ui/SearchInput';
import type { ServiceListFiltersProps } from '@/types/servicelist';

export default function ServiceListFilters({
  searchValue,
  onSearchChange,
}: ServiceListFiltersProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {/* 검색 */}
      <SearchInput
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="서비스 검색..."
        className="w-full md:w-80 h-10"
      />
    </div>
  );
}
