import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { audiobookshelfApi } from '../endpoints/audiobookshelf';
import type { UpdateAbsSettingsRequest } from '../types';

export const absKeys = {
  status: ['audiobookshelf', 'status'] as const,
  libraries: ['audiobookshelf', 'libraries'] as const,
  settings: ['audiobookshelf', 'settings'] as const,
};

export function useAbsStatus() {
  return useQuery({
    queryKey: absKeys.status,
    queryFn: audiobookshelfApi.getStatus,
  });
}

export function useAbsLibraries() {
  return useQuery({
    queryKey: absKeys.libraries,
    queryFn: audiobookshelfApi.getLibraries,
  });
}

export function useAbsScanLibrary() {
  return useMutation({
    mutationFn: (libraryId: string) => audiobookshelfApi.scanLibrary(libraryId),
  });
}

export function useAbsSettings() {
  return useQuery({
    queryKey: absKeys.settings,
    queryFn: audiobookshelfApi.getSettings,
  });
}

export function useUpdateAbsSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateAbsSettingsRequest) => audiobookshelfApi.updateSettings(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: absKeys.settings });
      queryClient.invalidateQueries({ queryKey: absKeys.status });
      queryClient.invalidateQueries({ queryKey: absKeys.libraries });
    },
  });
}

