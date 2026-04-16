import axios from 'axios';
import { store } from '../store';

if (!process.env.EXPO_PUBLIC_API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL environment variable is not set');
}

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    const isAuthRequest = config.url?.startsWith('/auth/');

    if (accessToken && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default axiosInstance;