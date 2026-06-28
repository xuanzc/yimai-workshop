// frontend/src/services/api.js
import axios from 'axios';
import { isMockMode, mockRequest } from './mockBackend';

const realApi = axios.create({
  baseURL: '/api/v1',
  timeout: 60000,
});

realApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

realApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      const base = import.meta.env.BASE_URL || '/';
      window.location.href = base + 'login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// 统一 API 入口：Mock 模式下走本地模拟，否则走真实后端
const api = {
  get(url, config) {
    if (isMockMode()) return mockRequest('GET', url, null, config?.params);
    return realApi.get(url, config);
  },
  post(url, data, config) {
    if (isMockMode()) return mockRequest('POST', url, data, config?.params);
    return realApi.post(url, data, config);
  },
  put(url, data, config) {
    if (isMockMode()) return mockRequest('PUT', url, data, config?.params);
    return realApi.put(url, data, config);
  },
  delete(url, config) {
    if (isMockMode()) return mockRequest('DELETE', url, null, config?.params);
    return realApi.delete(url, config);
  },
};

export default api;
