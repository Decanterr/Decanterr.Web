import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loginApi } from '../api/endpoints/login';
import type { LoginStartRequest, LoginCompleteRequest } from '../api/types';

export const loginKeys = {
  locales: ['login', 'locales'] as const,
};

export function useLocales() {
  return useQuery({
    queryKey: loginKeys.locales,
    queryFn: loginApi.getLocales,
    staleTime: Infinity,
  });
}

export function useStartLogin() {
  return useMutation({
    mutationFn: (request: LoginStartRequest) => loginApi.startLogin(request),
  });
}

export function useCompleteLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: LoginCompleteRequest) => loginApi.completeLogin(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useCancelLogin() {
  return useMutation({
    mutationFn: (sessionId: string) => loginApi.cancelLogin(sessionId),
  });
}
