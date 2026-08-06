import apiClient from '../client';
import type { ScanResponseDto, BookDto } from '../types';

export const libraryApi = {
  scan: () =>
    apiClient.post<ScanResponseDto>('/api/library/scan').then((r) => r.data),

  scanAccount: (accountId: string, locale?: string) =>
    apiClient.post<ScanResponseDto>(`/api/library/scan/${accountId}`, null, { params: { locale } }).then((r) => r.data),

  getScanStatus: () =>
    apiClient.get<{ scanning: boolean }>('/api/library/scan/status').then((r) => r.data),

  exportLibrary: (format: string = 'json') =>
    apiClient.get<BookDto[]>('/api/library/export', { params: { format } }).then((r) => r.data),
};
