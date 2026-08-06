import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi } from '../endpoints/books';
import type { UpdateTagsDto, UpdateRatingDto, UpdateStatusDto } from '../types';

export const bookKeys = {
  all: ['books'] as const,
  list: (params?: { includeDeleted?: boolean; skip?: number; take?: number }) =>
    [...bookKeys.all, 'list', params] as const,
  detail: (asin: string) => [...bookKeys.all, 'detail', asin] as const,
  search: (query: string) => [...bookKeys.all, 'search', query] as const,
  stats: ['books', 'stats'] as const,
};

export function useBooks(params?: { includeDeleted?: boolean; skip?: number; take?: number }) {
  return useQuery({
    queryKey: bookKeys.list(params),
    queryFn: () => booksApi.getAll(params),
  });
}

export function useBook(asin: string) {
  return useQuery({
    queryKey: bookKeys.detail(asin),
    queryFn: () => booksApi.getByAsin(asin),
    enabled: !!asin,
  });
}

export function useBookSearch(query: string) {
  return useQuery({
    queryKey: bookKeys.search(query),
    queryFn: () => booksApi.search(query),
    enabled: query.length > 0,
  });
}

export function useBookStats() {
  return useQuery({
    queryKey: bookKeys.stats,
    queryFn: booksApi.getStats,
  });
}

export function useUpdateTags() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ asin, dto }: { asin: string; dto: UpdateTagsDto }) =>
      booksApi.updateTags(asin, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
    },
  });
}

export function useUpdateRating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ asin, dto }: { asin: string; dto: UpdateRatingDto }) =>
      booksApi.updateRating(asin, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
    },
  });
}

export function useUpdateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ asin, dto }: { asin: string; dto: UpdateStatusDto }) =>
      booksApi.updateStatus(asin, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (asin: string) => booksApi.deleteBook(asin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
      queryClient.invalidateQueries({ queryKey: bookKeys.stats });
    },
  });
}

export function useRestoreBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (asin: string) => booksApi.restoreBook(asin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
      queryClient.invalidateQueries({ queryKey: bookKeys.stats });
    },
  });
}
