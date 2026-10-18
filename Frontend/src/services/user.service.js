import api from '@/lib/axios';

export const userService = {
  searchUsers: async (query) => {
    const response = await api.get(`/api/user/search/users?query=${query}`);
    return response.data;
  },

  sendFriendRequest: async (recipientId) => {
    const response = await api.post(`/api/user/friends/request/${recipientId}`);
    return response.data;
  },

  acceptFriendRequest: async (senderId) => {
    const response = await api.post(`/api/user/friends/accept/${senderId}`);
    return response.data;
  },

  rejectFriendRequest: async (senderId) => {
    const response = await api.post(`/api/user/friends/reject/${senderId}`);
    return response.data;
  },

  getFriends: async () => {
    const response = await api.get('/api/user/friends/list');
    return response.data;
  },

  getFriendRequests: async () => {
    const response = await api.get('/api/user/friends/requests');
    return response.data;
  },

  removeFriend: async (friendId) => {
    const response = await api.delete(`/api/user/friends/${friendId}`);
    return response.data;
  },

  updateTheme: async (theme) => {
    const response = await api.put('/api/user/theme', { theme });
    return response.data;
  },

  generateInviteCode: async () => {
    const response = await api.post('/api/user/invite/generate');
    return response.data;
  },

  acceptInvite: async (inviteCode) => {
    const response = await api.post(`/api/user/invite/accept/${inviteCode}`);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/api/user/profile', profileData);
    return response.data;
  },
};
