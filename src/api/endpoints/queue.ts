import apiClient from '../client';
import type { QueueItemDto } from '../types';

export const queueApi = {
  getAll: () =>
    apiClient.get<QueueItemDto[]>('/api/queue').then((r) => r.data),

  removeItem: (asin: string) =>
    apiClient.delete(`/api/queue/${asin}`).then((r) => r.data),

  clearAll: () =>
    apiClient.delete('/api/queue').then((r) => r.data),
};
