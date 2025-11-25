import type { ServiceSummary } from '@/types/apm';

export type ServiceListCategory = 'list' | 'card';

export interface ServiceListSidebarItem {
  key: ServiceListCategory;
  label: string;
  description: string;
}

export interface PaginationControls {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export interface CategoryContentProps {
  category: ServiceListCategory;
  services: ServiceSummary[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onRowClick: (service: ServiceSummary) => void;
  onCardClick?: (service: ServiceSummary) => void;
  onCreateClick?: () => void;
  pagination?: PaginationControls;
}

export interface ServiceListFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export interface ServiceListSidebarProps {
  value: ServiceListCategory;
  onChange: (category: ServiceListCategory) => void;
}
