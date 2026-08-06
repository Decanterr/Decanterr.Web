import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '../endpoints/accounts';

export const accountKeys = {
  all: ['accounts'] as const,
  list: () => [...accountKeys.all, 'list'] as const,
  detail: (id: string) => [...accountKeys.all, 'detail', id] as const,
};

export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.list(),
    queryFn: accountsApi.getAll,
  });
}

export function useAccount(accountId: string) {
  return useQuery({
    queryKey: accountKeys.detail(accountId),
    queryFn: () => accountsApi.getById(accountId),
    enabled: !!accountId,
  });
}

export function useSetScanEnabled() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId, enabled, locale }: { accountId: string; enabled: boolean; locale?: string }) =>
      accountsApi.setScanEnabled(accountId, enabled, locale),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId, locale }: { accountId: string; locale?: string }) =>
      accountsApi.deleteAccount(accountId, locale),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}
