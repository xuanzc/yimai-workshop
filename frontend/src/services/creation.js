// frontend/src/services/creation.js
import api from './api';

export const creationApi = {
  create: (data) => api.post('/creations', data),
  list: (params) => api.get('/creations', { params }),
  get: (id) => api.get(`/creations/${id}`),
  delete: (id) => api.delete(`/creations/${id}`),
  switchAudience: (id, audience) => api.post(`/creations/${id}/switch-audience`, { audience }),
};
