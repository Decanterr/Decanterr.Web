import { useMutation, useQueryClient } from '@tanstack/react-query';
import { liberateApi } from '../endpoints/liberate';
import { bookKeys } from './useBooks';
import type { BulkLiberateDto } from '../types';

export function useLiberate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (asin: string) => liberateApi.liberateByAsin(asin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}

export function useLiberateByInput() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: string) => liberateApi.liberateByInput(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}

export function useBulkLiberate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: BulkLiberateDto) => liberateApi.liberateBulk(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}
