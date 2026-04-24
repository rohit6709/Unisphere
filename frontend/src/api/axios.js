import axios from 'axios';

// Get base URL from environment variables, fallback to localhost for dev
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const normalizeUrl = (url = '') => {
  if (typeof url !== 'string') {
    return url;
  }

  if (url === '/api/v1') {
    return '/';
  }

  if (url.startsWith('/api/v1/')) {
    return url.slice('/api/v1'.length);
  }

  return url;
};

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Crucial for sending cookies (JWT) with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (config.url) {
    config.url = normalizeUrl(config.url);
  }

  return config;
});

// Interceptor for responses to handle token refresh or global 401s
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // We can handle global 401s here, like forcing a logout if needed
    return Promise.reject(error);
  }
);