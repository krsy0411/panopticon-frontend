'use client';

// 인증 상태를 관리하는 훅 모음
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthResponse } from '@/src/types/auth';

const fetchCurrentUser = async (): Promise<AuthResponse> => {
  const authServerUrl = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL;
  if (!authServerUrl) {
    return { authenticated: false };
  }

  const response = await fetch(`${authServerUrl}/users/me`, {
    credentials: 'include',
  });

  if (!response.ok) {
    return { authenticated: false };
  }

  const user = await response.json();
  return { authenticated: true, user };
};

const logout = async (): Promise<void> => {
  const authServerUrl = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL;
  if (!authServerUrl) {
    throw new Error('Auth server URL not configured');
  }

  const response = await fetch(`${authServerUrl}/logout`, {
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
    staleTime: 0, // 항상 fresh 데이터 가져오기
    gcTime: 0, // 캐시 보관 안 함
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], { authenticated: false });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      window.location.href = '/';
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
