import apiClient from '../client';
import type { LoginStartRequest, LoginStartResponse, LoginCompleteRequest, AudibleLocale } from '../types';

export const loginApi = {
  getLocales: () =>
    apiClient.get<AudibleLocale[]>('/api/login/locales').then((r) => r.data),

  startLogin: (request: LoginStartRequest) =>
    apiClient.post<LoginStartResponse>('/api/login/start', request).then((r) => r.data),

  completeLogin: (request: LoginCompleteRequest) =>
    apiClient.post<{ message: string; accountId: string }>('/api/login/complete', request).then((r) => r.data),

  cancelLogin: (sessionId: string) =>
    apiClient.post('/api/login/cancel', { sessionId }).then((r) => r.data),
};
