// frontend/src/store/authStore.js
import { create } from 'zustand';
import { authApi } from '../services/auth';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,

  login: async (account, password) => {
    const res = await authApi.login({ account, password });
    localStorage.setItem('token', res.data.token);
    set({ user: res.data, token: res.data.token, isAuthenticated: true });
    return res;
  },

  register: async (username, email, password) => {
    const res = await authApi.register({ username, email, password });
    localStorage.setItem('token', res.data.token);
    set({ user: res.data, token: res.data.token, isAuthenticated: true });
    // 注册后获取完整用户信息（含 role、created_at 等字段）
    try {
      const me = await authApi.getMe();
      set({ user: me.data });
    } catch {
      // 忽略，已设置基本用户信息
    }
    return res;
  },

  fetchUser: async () => {
    try {
      const res = await authApi.getMe();
      set({ user: res.data });
      return res.data;
    } catch {
      set({ user: null, token: null, isAuthenticated: false });
      localStorage.removeItem('token');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
