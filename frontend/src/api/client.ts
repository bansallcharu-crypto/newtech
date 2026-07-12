import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL
});
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('nextech_admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    if (data?.error) return data.error;
    if (err.message) return err.message;
  }
  return 'Something went wrong. Please try again.';
}

export default client;
