'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import ServiceListSidebar from '@/components/features/services/servicelist/Sidebar';
import CategoryContent from '@/components/features/services/servicelist/CategoryContent';
import ServiceListFilters from '@/components/features/services/servicelist/Filters';
import CreateServiceModal from '@/components/features/services/servicelist/CreateService';
import { SelectDate } from '@/components/features/services/SelectDate';
import Breadcrumb from '@/components/ui/Breadcrumb';
import type { CreateServiceFormValues } from '@/types/CreateService';
import { getServices } from '@/src/api/apm';
import type { ServiceSummary } from '@/types/apm';
import type { ServiceListCategory } from '@/types/servicelist';

export default function ServicesPage() {
  const router = useRouter();

  const [category, setCategory] = useState<ServiceListCategory>('list');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceModalMode, setServiceModalMode] = useState<'create' | 'edit'>('create');
  const [serviceModalInitialValues, setServiceModalInitialValues] =
    useState<Partial<CreateServiceFormValues>>();

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
    const services = data?.services ?? [];
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return services;
    return services.filter(
      (service) =>
        service.service_name.toLowerCase().includes(keyword) ||
        service.environment.toLowerCase().includes(keyword),
    );
  }, [data?.services, searchKeyword]);

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

  // 서비스 클릭 시 상세 페이지 이동
  const handleServiceRowClick = (service: ServiceSummary) => {
    router.push(`/services/${service.service_name}`);
  };

  const isEmpty = !isLoading && filteredServices.length === 0;

  const openServiceModal = (
    mode: 'create' | 'edit',
    initialValues?: Partial<CreateServiceFormValues>,
  ) => {
    setServiceModalMode(mode);
    setServiceModalInitialValues(initialValues);
    setIsServiceModalOpen(true);
  };

  const handleCreateClick = () => {
    openServiceModal('create');
  };

  const handleEditClick = () => {
    const targetService = filteredServices[0];
    if (targetService) {
      openServiceModal('edit', {
        serviceName: targetService.service_name,
        environment: targetService.environment,
      });
      return;
    }
    openServiceModal('edit');
  };

  const deriveInstallScenario = (
    values: CreateServiceFormValues,
  ): 'frontend-trace' | 'backend-log' | 'backend-trace' | 'backend-log-trace' | null => {
    if (values.serviceType === 'ui') {
      return 'frontend-trace';
    }

    if (values.serviceType === 'api') {
      if (values.collectLogs && values.collectTraces) return 'backend-log-trace';
      if (values.collectLogs) return 'backend-log';
      if (values.collectTraces) return 'backend-trace';
    }

    return null;
  };

  // 설치 시작 클릭 -> Install Agent 페이지
  const handleServiceModalSubmit = (formValues: CreateServiceFormValues) => {
    setIsServiceModalOpen(false);

    const scenario = deriveInstallScenario(formValues);
    if (!scenario) {
      router.push('/services/install');
      return;
    }

    const params = new URLSearchParams({
      scenario,
      serviceType: formValues.serviceType,
      collectLogs: String(formValues.collectLogs),
      collectTraces: String(formValues.collectTraces),
    });

    router.push(`/services/install?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-6">
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

          {/* 필터 (검색 / 시간 / 페이지당 개수) */}
          <ServiceListFilters
            searchValue={searchKeyword}
            onSearchChange={(value) => {
              setSearchKeyword(value);
              setPage(1);
            }}
            pageSize={pageSize}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
            onEditClick={handleEditClick}
            onCreateClick={handleCreateClick}
          />

          {/* 카테고리별 콘텐츠 */}
          <CategoryContent
            category={category}
            services={paginatedServices}
            isLoading={isLoading}
            isError={isError}
            isEmpty={isEmpty}
            onRowClick={handleServiceRowClick}
            pagination={{
              page: currentPage,
              totalPages,
              onPrev: handlePrev,
              onNext: handleNext,
            }}
          />
        </main>
      </section>
      <CreateServiceModal
        open={isServiceModalOpen}
        mode={serviceModalMode}
        initialValues={serviceModalInitialValues}
        onClose={() => setIsServiceModalOpen(false)}
        onSubmit={handleServiceModalSubmit}
      />
    </div>
  );
}
