import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryApi } from '../endpoints/library';
import { bookKeys } from './useBooks';

export const libraryKeys = {
  scanStatus: ['library', 'scanStatus'] as const,
};

export function useScanStatus() {
  return useQuery({
    queryKey: libraryKeys.scanStatus,
    queryFn: libraryApi.getScanStatus,
    refetchInterval: (query) => (query.state.data?.scanning ? 2000 : false),
  });
}

export function useScanLibrary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => libraryApi.scan(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.scanStatus });
    },
    onSettled: () => {
      // After scan completes, refresh books
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
      queryClient.invalidateQueries({ queryKey: bookKeys.stats });
    },
  });
}

export function useScanAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId, locale }: { accountId: string; locale?: string }) =>
      libraryApi.scanAccount(accountId, locale),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.scanStatus });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
      queryClient.invalidateQueries({ queryKey: bookKeys.stats });
    },
  });
}

export function useExportLibrary() {
  return useMutation({
    mutationFn: (format: string = 'json') => libraryApi.exportLibrary(format),
  });
}
