'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { HiCube, HiPencil, HiTrash } from 'react-icons/hi2';
import type { ApplicationSummary } from './types';

interface AppCardProps {
  app: ApplicationSummary;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AppCard({ app, onEdit, onDelete }: AppCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return '-';
    const date = new Date(iso);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const updateCachedLastAccess = (timestamp: string) => {
    queryClient.setQueryData<ApplicationSummary[] | undefined>(['apps'], (prev) => {
      if (!prev) return prev;
      return prev.map((item) =>
        item.id === app.id ? { ...item, lastAccessedAt: timestamp } : item,
      );
    });
  };

  const recordLastAccess = async () => {
    const fallback = new Date().toISOString();

    try {
      const response = await fetch(`/api/apps/${app.id}/access`, {
        method: 'POST',
      });

      if (!response.ok) {
        updateCachedLastAccess(fallback);
        return;
      }

      const data = (await response.json()) as { lastAccessedAt?: string | null };
      updateCachedLastAccess(data.lastAccessedAt ?? fallback);
    } catch (error) {
      console.error('Failed to record last access', error);
      updateCachedLastAccess(fallback);
    }
  };

  const handleNavigate = () => {
    recordLastAccess();
    router.push(`/apps/${app.id}/services`);
  };

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onEdit?.();
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete?.();
  };

  return (
    <article
      onClick={handleNavigate}
      className={`
        group cursor-pointer rounded-2xl border bg-white p-6 flex flex-col
        hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-[3px]
        transition-all min-h-[340px]
        border-slate-200 hover:border-blue-300
      `}
    >
      {/* 헤더 */}
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition">
            {app.name}
          </h3>

          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            <HiCube className="h-4 w-4" />
            서비스 모니터링
          </span>
        </div>

        {app.description && (
          <p className="text-sm text-slate-500 line-clamp-1">{app.description}</p>
        )}
      </header>

      {/* 설명이 없을 경우 안내 문구 */}
      {!app.description && (
        <p className="text-sm text-slate-400 mb-6">
          어플리케이션 별로 서비스 상태를 확인할 수 있습니다.
        </p>
      )}

      {/* 생성/수정일 + 액션 */}
      <footer className="mt-auto flex items-center justify-between gap-4 text-xs text-slate-500 border-t pt-4 border-slate-200">
        <div className="flex flex-col gap-1">
          <span className="whitespace-nowrap">생성일: {formatDateTime(app.createdAt)}</span>
          <span className="whitespace-nowrap">
            접속일: {formatDateTime(app.lastAccessedAt ?? app.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={handleEditClick}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:border-blue-500 hover:text-blue-600 whitespace-nowrap"
          >
            <HiPencil className="h-4 w-4" /> 수정
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:border-red-500 hover:text-red-600 whitespace-nowrap"
          >
            <HiTrash className="h-4 w-4" /> 삭제
          </button>
        </div>
      </footer>
    </article>
  );
}
