'use client';

import { useEffect, useState } from 'react';
import { HiArrowPath, HiPlus, HiPencil, HiTrash } from 'react-icons/hi2';
import type { ApplicationSummary } from '@/components/features/register/types';
import { AppForm } from '@/components/features/register/AppForm';
import { AppList } from '@/components/features/register/AppList';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/register/dialog';

export default function RegisterPage() {
  const [apps, setApps] = useState<ApplicationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchApplications = async () => {
    try {
      setIsError(false);
      setIsLoading(true);

      // TODO: 이후 API 연동 시 fetch('/api/applications') 로 변경
      await new Promise((r) => setTimeout(r, 600)); // mock delay

      const mockApps: ApplicationSummary[] = [
        {
          id: '1',
          name: 'Bank',
          description: '뱅크 주요 기능 모음',
          serviceCount: 8,

          errorCount: 38,
          errorDiff: +3,

          requestCount: 120000,
          requestDiff: -900,

          createdAt: '2025-10-12',
        },
        {
          id: '2',
          name: 'Map',
          description: '지도 검색/길찾기 기능',
          serviceCount: 5,

          errorCount: 12,
          errorDiff: -2,

          requestCount: 78000,
          requestDiff: +1400,

          createdAt: '2025-09-02',
        },
        {
          id: '3',
          name: 'Mall',
          description: '쇼핑/상품 브라우징 기능',
          serviceCount: 12,

          errorCount: 4,
          errorDiff: 0,

          requestCount: 240000,
          requestDiff: +6000,

          createdAt: '2025-07-21',
        },
      ];

      setApps(mockApps);
    } catch (error) {
      console.error('[App Register] fetchApplications failed', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleCreate = async (name: string, description?: string) => {
    console.info('[App Register] Creating application', { name, description });

    // TODO: 실제 API 호출
    await new Promise((r) => r(null));

    fetchApplications();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900">Applications</h1>
            <p className="text-slate-500 text-base">
              애플리케이션을 등록하고 실시간으로 모니터링하세요
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
            >
              <HiPlus className="h-4 w-4" />
              생성
            </button>
            <button
              disabled
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-400 cursor-not-allowed"
            >
              <HiPencil className="h-4 w-4" />
              수정
            </button>
            <button
              disabled
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-400 cursor-not-allowed"
            >
              <HiTrash className="h-4 w-4" />
              삭제
            </button>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-16 text-center">
            <HiArrowPath className="mb-3 h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-600">로딩 중...</p>
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-red-600">데이터를 불러오는데 실패했습니다.</p>
            <button
              onClick={fetchApplications}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              <HiArrowPath className="h-4 w-4" />
              다시 시도
            </button>
          </div>
        )}

        {!isLoading && !isError && <AppList apps={apps} />}
      </div>

      {/* 생성 다이얼로그 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>새 애플리케이션 등록</DialogTitle>
            <DialogDescription className="text-slate-500">
              모니터링할 애플리케이션 정보를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <AppForm onCreate={handleCreate} onClose={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
