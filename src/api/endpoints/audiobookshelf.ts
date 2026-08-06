import apiClient from '../client';
import type { AbsStatusResponse, AbsLibrary } from '../types';

export const audiobookshelfApi = {
  getStatus: () =>
    apiClient.get<AbsStatusResponse>('/api/audiobookshelf/status').then((r) => r.data),

  getLibraries: () =>
    apiClient.get<AbsLibrary[]>('/api/audiobookshelf/libraries').then((r) => r.data),

  scanLibrary: (libraryId: string) =>
    apiClient.post(`/api/audiobookshelf/libraries/${libraryId}/scan`).then((r) => r.data),
};
