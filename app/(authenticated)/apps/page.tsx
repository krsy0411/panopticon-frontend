'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiArrowPath, HiPlus } from 'react-icons/hi2';
import { AppForm } from '@/components/features/apps/AppForm';
import { AppList } from '@/components/features/apps/AppList';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/register/dialog';
import { fetchApps, createApp, updateApp, deleteApp } from '@/lib/api/apps';

export default function RegisterPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | undefined>();

  // 앱 목록 조회
  const {
    data: apps = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['apps'],
    queryFn: fetchApps,
  });

  // 선택된 앱 정보
  const selectedApp = apps.find((app) => app.id === selectedAppId);

  // 앱 생성 mutation
  const createMutation = useMutation({
    mutationFn: createApp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      console.error('[App Register] Create failed:', error);
    },
  });

  // 앱 수정 mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) =>
      updateApp(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      setIsEditDialogOpen(false);
      setSelectedAppId(undefined);
    },
    onError: (error) => {
      console.error('[App Register] Update failed:', error);
    },
  });

  // 앱 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: deleteApp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      setSelectedAppId(undefined);
    },
    onError: (error) => {
      console.error('[App Register] Delete failed:', error);
    },
  });

  const handleCreate = async (name: string, description?: string) => {
    await createMutation.mutateAsync({ name, description });
  };

  const handleEdit = async (name: string, description?: string) => {
    if (!selectedAppId) return;
    await updateMutation.mutateAsync({
      id: selectedAppId,
      data: { name, description },
    });
  };

  const handleDelete = (id: string) => {
    if (deleteMutation.isPending) {
      return;
    }

    if (confirm('정말로 이 애플리케이션을 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenEditDialog = (id: string) => {
    setSelectedAppId(id);
    setIsEditDialogOpen(true);
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
          </div>
        </div>

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
              onClick={() => refetch()}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              <HiArrowPath className="h-4 w-4" />
              다시 시도
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <AppList apps={apps} onEditApp={handleOpenEditDialog} onDeleteApp={handleDelete} />
        )}
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
          <AppForm
            key="create-form"
            onCreate={handleCreate}
            onClose={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>애플리케이션 수정</DialogTitle>
            <DialogDescription className="text-slate-500">
              수정할 애플리케이션 정보를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <AppForm
              key={selectedApp.id}
              onCreate={handleEdit}
              onClose={() => setIsEditDialogOpen(false)}
              initialName={selectedApp.name}
              initialDescription={selectedApp.description}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
