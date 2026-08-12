import apiClient from '../client';
import type {
  BookDto,
  SearchResultDto,
  StatsDto,
  UpdateTagsDto,
  UpdateRatingDto,
  UpdateStatusDto,
} from '../types';

export const booksApi = {
  getAll: (params?: { includeDeleted?: boolean; skip?: number; take?: number }) =>
    apiClient.get<BookDto[]>('/api/books', { params }).then((r) => r.data),

  getByAsin: (asin: string) =>
    apiClient.get<BookDto>(`/api/books/${asin}`).then((r) => r.data),

  search: (query: string) =>
    apiClient.get<SearchResultDto>('/api/books/search', { params: { q: query } }).then((r) => r.data),

  getCoverUrl: (asin: string) => {
    const key = import.meta.env.VITE_API_KEY || '__DECANTERR_API_KEY__';
    return `/api/books/${asin}/cover?api_key=${encodeURIComponent(key)}`;
  },

  updateTags: (asin: string, dto: UpdateTagsDto) =>
    apiClient.put(`/api/books/${asin}/tags`, dto).then((r) => r.data),

  updateRating: (asin: string, dto: UpdateRatingDto) =>
    apiClient.put(`/api/books/${asin}/rating`, dto).then((r) => r.data),

  updateStatus: (asin: string, dto: UpdateStatusDto) =>
    apiClient.put(`/api/books/${asin}/status`, dto).then((r) => r.data),

  deleteBook: (asin: string) =>
    apiClient.delete(`/api/books/${asin}`).then((r) => r.data),

  restoreBook: (asin: string) =>
    apiClient.post(`/api/books/${asin}/restore`).then((r) => r.data),

  getStats: () =>
    apiClient.get<StatsDto>('/api/books/stats').then((r) => r.data),
};
