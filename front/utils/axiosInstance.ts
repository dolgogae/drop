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

    // 로그인/회원가입 요청에는 기존 토큰을 포함하지 않음
    const isAuthRequest = config.url?.startsWith('/auth/');

    if (accessToken && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // FormData 전송 시 Content-Type 헤더를 삭제하여 Axios가 자동으로
    // multipart/form-data와 boundary를 설정하도록 함
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;