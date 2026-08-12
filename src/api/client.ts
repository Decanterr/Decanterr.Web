import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const apiKey = import.meta.env.VITE_API_KEY || '__DECANTERR_API_KEY__';
  if (apiKey) {
    config.headers['X-Api-Key'] = apiKey;
  }
  return config;
});

export default apiClient;
