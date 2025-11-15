'use client';

// 인증 상태를 관리하는 훅 모음
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthResponse } from '@/src/types/auth';

const fetchCurrentUser = async (): Promise<AuthResponse> => {
  const response = await fetch('/api/auth/me', {
    credentials: 'include',
  });

  if (!response.ok) {
    return { authenticated: false };
  }

  return response.json();
};

const logout = async (): Promise<void> => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }
};

export function useAuth() {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5분
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], { authenticated: false });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      window.location.href = '/auth';
    },
  });

  return {
    user: data?.user,
    isAuthenticated: data?.authenticated ?? false,
    isLoading,
    error,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
    refetchUser,
  };
}
