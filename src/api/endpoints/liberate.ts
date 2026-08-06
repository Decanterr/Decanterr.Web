import apiClient from '../client';
import type { LiberateResponseDto, BulkLiberateDto } from '../types';

export const liberateApi = {
  liberateByInput: (input: string) =>
    apiClient.post<LiberateResponseDto>('/api/liberate', { input }).then((r) => r.data),

  liberateByAsin: (asin: string) =>
    apiClient.post<LiberateResponseDto>(`/api/liberate/${asin}`).then((r) => r.data),

  liberateBulk: (dto: BulkLiberateDto) =>
    apiClient.post<LiberateResponseDto[]>('/api/liberate/bulk', dto).then((r) => r.data),
};
