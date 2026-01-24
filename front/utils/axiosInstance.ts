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

    console.log('[axios] Base URL:', config.baseURL);
    console.log('[axios] Request URL:', config.url);
    console.log('[axios] Full URL:', `${config.baseURL}${config.url}`);
    console.log('[axios] Token exists:', !!accessToken);

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
  (response) => {
    console.log('[axios] Response status:', response.status);
    return response;
  },
  (error) => {
    console.log('[axios] Error:', error.message);
    if (error.response) {
      console.log('[axios] Error status:', error.response.status);
      console.log('[axios] Error data:', error.response.data);
    } else if (error.request) {
      console.log('[axios] No response received - request was made but no response');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;