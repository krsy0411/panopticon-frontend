'use client';

import StateHandler from '@/components/ui/StateHandler';
import ServiceListTable from './Table';
import AddServiceCard from './cards/AddServiceCard';
import ServiceCard from './cards/ServiceCard';

import type { CategoryContentProps, ServiceListCategory } from '@/types/servicelist';

export const serviceListCategoryMeta: Record<
  ServiceListCategory,
  { title: string; subtitle: string; stateType: 'table' | 'general' }
> = {
  list: {
    title: 'List',
    subtitle: '테이블 뷰',
    stateType: 'table',
  },
  card: {
    title: 'Card',
    subtitle: '요약 카드',
    stateType: 'general',
  },
};

export default function CategoryContent({
  category,
  services,
  isLoading,
  isError,
  isEmpty,
  onRowClick,
  onCardClick,
  onCreateClick,
  pagination,
}: CategoryContentProps) {
  const cardClickHandler = onCardClick ?? onRowClick;

  if (category === 'list') {
    return (
      <StateHandler
        isLoading={isLoading}
        isError={isError}
        isEmpty={isEmpty}
        type="table"
        height={500}
        loadingMessage="서비스 목록을 불러오는 중..."
        errorMessage="서비스 목록을 불러올 수 없습니다"
        emptyMessage="표시할 서비스가 없습니다"
      >
        <ServiceListTable services={services} pagination={pagination} onRowClick={onRowClick} />
      </StateHandler>
    );
  }

  return (
    <div>
      {/* 항상 노출되는 Add 카드 + 서비스 카드 그리드 (ServiceCardGrid 제거 후 인라인) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <div className="col-span-1">
          <AddServiceCard onClick={onCreateClick} />
        </div>

        {services.map((service) => (
          <ServiceCard
            key={service.service_name}
            service={service}
            onClick={cardClickHandler ? () => cardClickHandler(service) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
