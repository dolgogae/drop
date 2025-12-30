import axios from 'axios';
import { store } from '../store';

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    console.log('[axios] Request URL:', config.url);
    console.log('[axios] Token exists:', !!accessToken);

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;