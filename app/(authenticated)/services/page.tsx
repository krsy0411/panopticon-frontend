'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import ServiceListSidebar from '@/components/features/services/servicelist/Sidebar';
import CategoryContent from '@/components/features/services/servicelist/CategoryContent';
import { SelectDate } from '@/components/features/services/SelectDate';
import Breadcrumb from '@/components/ui/Breadcrumb';
import TagSearchBar from '@/components/ui/TagSearchBar';
import { getServices } from '@/src/api/apm';
import type { ServiceSummary } from '@/types/apm';
import type { ServiceListCategory } from '@/types/servicelist';
import type { Tag, TagKey } from '@/types/tagSearchBar';

// TagSearchBar용 태그 키 정의
const TAG_KEYS: TagKey[] = [
  { key: 'name', label: '서비스명' },
  { key: 'env', label: '환경' },
];

export default function ServicesPage() {
  const router = useRouter();

  const [category, setCategory] = useState<ServiceListCategory>('card');
  const [tags, setTags] = useState<Tag[]>([]);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 시간 범위 생성
  const timeRange = useMemo(() => {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    return {
      from: twoWeeksAgo.toISOString(),
      to: now.toISOString(),
    };
  }, []);

  // 서비스 API 호출
  const { data, isLoading, isError } = useQuery({
    queryKey: ['services', timeRange],
    queryFn: () =>
      getServices({
        limit: 1000,
        ...timeRange,
      }),
  });

  // 검색 필터 적용
  const filteredServices = useMemo(() => {
    let services = data?.services ?? [];

    // 태그 필터링
    tags.forEach(({ key, value }) => {
      if (key === 'name') {
        services = services.filter((s) =>
          s.service_name.toLowerCase().includes(value.toLowerCase()),
        );
      }
      if (key === 'env') {
        services = services.filter((s) =>
          s.environment.toLowerCase().includes(value.toLowerCase()),
        );
      }
    });

    // 키워드 필터링
    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      services = services.filter(
        (s) => s.service_name.toLowerCase().includes(k) || s.environment.toLowerCase().includes(k),
      );
    }

    return services;
  }, [data?.services, tags, keyword]);

  // 페이지네이션
  const totalItems = filteredServices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = useMemo(() => Math.min(page, totalPages), [page, totalPages]);

  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredServices.slice(start, start + pageSize);
  }, [filteredServices, currentPage, pageSize]);

  const handlePrev = () => setPage(Math.max(1, currentPage - 1));
  const handleNext = () => setPage(Math.min(totalPages, currentPage + 1));

  // 카테고리 변경 시 초기화
  const handleCategoryChange = (nextCategory: ServiceListCategory) => {
    setCategory(nextCategory);
    setPage(1);
  };

  // TagSearchBar용 suggestions
  const serviceNameSuggestions = useMemo(() => {
    const allServices = data?.services ?? [];
    return [...new Set(allServices.map((s) => s.service_name))];
  }, [data?.services]);

  const environmentSuggestions = useMemo(() => {
    const allServices = data?.services ?? [];
    return [...new Set(allServices.map((s) => s.environment))];
  }, [data?.services]);

  // 서비스 클릭 시 상세 페이지 이동
  const handleServiceRowClick = (service: ServiceSummary) => {
    router.push(`/services/${service.service_name}`);
  };

  const isEmpty = !isLoading && filteredServices.length === 0;

  // Agent 설치 페이지로 이동
  const handleCreateClick = () => {
    router.push('/services/install');
  };

  return (
    <div className="bg-gray-50 p-8 space-y-6 h-full">
      <section className="flex flex-col gap-6 lg:flex-row">
        {/* 좌측 사이드바 */}
        <aside className="w-full lg:w-56 shrink-0 space-y-4 lg:sticky lg:top-6 lg:self-start lg:z-10">
          <div className="space-y-4 w-full">
            <ServiceListSidebar value={category} onChange={handleCategoryChange} />
            <SelectDate className="w-full" />
          </div>
        </aside>

        <main className="flex-1 min-w-0 space-y-6">
          <div>
            <Breadcrumb />
            <span className="text-xs text-gray-400">{filteredServices.length}개 서비스</span>
          </div>

          {/* 필터 (검색) */}
          <div className="w-full">
            <TagSearchBar
              tags={tags}
              onTagsChange={(newTags) => {
                setTags(newTags);
                setPage(1);
              }}
              keyword={keyword}
              onKeywordChange={(newKeyword) => {
                setKeyword(newKeyword);
                setPage(1);
              }}
              messageKeywords={serviceNameSuggestions}
              serviceNames={environmentSuggestions}
              tagKeys={TAG_KEYS}
              placeholder="name:order  env:production  또는 서비스명/환경 검색"
            />
          </div>

          {/* 카테고리별 콘텐츠 */}
          <CategoryContent
            category={category}
            services={paginatedServices}
            isLoading={isLoading}
            isError={isError}
            isEmpty={isEmpty}
            onRowClick={handleServiceRowClick}
            onCreateClick={handleCreateClick}
            pagination={{
              page: currentPage,
              totalPages,
              onPrev: handlePrev,
              onNext: handleNext,
            }}
          />
        </main>
      </section>
    </div>
  );
}
