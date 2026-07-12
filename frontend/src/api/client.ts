import axios from 'axios';

// In local dev, '/api' is proxied to the backend by Vite (see vite.config.js).
// In production (e.g. Vercel), set VITE_API_URL to the deployed backend's full URL,
// e.g. https://newtech-g2c4.onrender.com/api
const baseURL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL
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