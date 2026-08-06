import { useQuery, useMutation } from '@tanstack/react-query';
import { audiobookshelfApi } from '../endpoints/audiobookshelf';

export const absKeys = {
  status: ['audiobookshelf', 'status'] as const,
  libraries: ['audiobookshelf', 'libraries'] as const,
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
