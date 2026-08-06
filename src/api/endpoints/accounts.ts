import apiClient from '../client';
import type { AccountDto } from '../types';

export const accountsApi = {
  getAll: () =>
    apiClient.get<AccountDto[]>('/api/accounts').then((r) => r.data),

  getById: (accountId: string, locale?: string) =>
    apiClient.get<AccountDto>(`/api/accounts/${accountId}`, { params: { locale } }).then((r) => r.data),

  setScanEnabled: (accountId: string, enabled: boolean, locale?: string) =>
    apiClient.put(`/api/accounts/${accountId}/scan`, null, { params: { enabled, locale } }).then((r) => r.data),

  deleteAccount: (accountId: string, locale?: string) =>
    apiClient.delete(`/api/accounts/${accountId}`, { params: { locale } }).then((r) => r.data),
};
