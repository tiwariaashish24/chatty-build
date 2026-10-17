import api from '@/lib/axios';

export const authService = {
  signup: async (userData) => {
    const response = await api.post('/api/auth/signup', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },

  checkAuth: async () => {
    const response = await api.get('/api/auth/check');
    return response.data;
  },

  updateProfile: async (profilePic) => {
    const response = await api.put('/api/auth/update-profile', { profilePic });
    return response.data;
  },
};
