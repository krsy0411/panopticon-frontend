import type { ApplicationSummary } from '@/components/features/apps/types';

// 앱 목록 조회
export async function fetchApps(): Promise<ApplicationSummary[]> {
  const res = await fetch('/api/apps', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch apps');
  }

  return res.json();
}

// 앱 생성
export async function createApp(data: {
  name: string;
  description?: string;
}): Promise<ApplicationSummary> {
  const res = await fetch('/api/apps', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to create app');
  }

  return res.json();
}

// 앱 수정
export async function updateApp(
  id: string,
  data: {
    name?: string;
    description?: string;
  },
): Promise<ApplicationSummary> {
  const res = await fetch(`/api/apps/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to update app');
  }

  return res.json();
}

// 앱 삭제
export async function deleteApp(id: string): Promise<void> {
  const res = await fetch(`/api/apps/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to delete app');
  }
}

// 특정 앱 조회
export async function fetchApp(id: string): Promise<ApplicationSummary> {
  const res = await fetch(`/api/apps/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch app');
  }

  return res.json();
}
