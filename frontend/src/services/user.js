// frontend/src/services/user.js
import api from './api';

export const userApi = {
  updateProfile: (data) => api.put('/users/me', data),
  updatePassword: (data) => api.put('/users/password', data),
  getStats: () => api.get('/users/stats'),
};
