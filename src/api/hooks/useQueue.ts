import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queueApi } from '../endpoints/queue';

export const queueKeys = {
  all: ['queue'] as const,
  list: () => [...queueKeys.all, 'list'] as const,
};

export function useQueue() {
  return useQuery({
    queryKey: queueKeys.list(),
    queryFn: queueApi.getAll,
    refetchInterval: 5000,
  });
}

export function useRemoveQueueItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (asin: string) => queueApi.removeItem(asin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueKeys.all });
    },
  });
}

export function useClearQueue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => queueApi.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueKeys.all });
    },
  });
}
