import apiClient from '../client';
import type { AbsStatusResponse, AbsLibrary, AbsSettings, UpdateAbsSettingsRequest } from '../types';

export const audiobookshelfApi = {
  getStatus: () =>
    apiClient.get<AbsStatusResponse>('/api/audiobookshelf/status').then((r) => r.data),

  getLibraries: () =>
    apiClient.get<AbsLibrary[]>('/api/audiobookshelf/libraries').then((r) => r.data),

  scanLibrary: (libraryId: string) =>
    apiClient.post(`/api/audiobookshelf/libraries/${libraryId}/scan`).then((r) => r.data),

  getSettings: () =>
    apiClient.get<AbsSettings>('/api/audiobookshelf/settings').then((r) => r.data),

  updateSettings: (request: UpdateAbsSettingsRequest) =>
    apiClient.put('/api/audiobookshelf/settings', request).then((r) => r.data),
};

