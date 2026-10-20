import api from '@/lib/axios';

export const messageService = {
  getUsers: async () => {
    const response = await api.get('/api/message/users');
    return response.data;
  },

  getOnlineUsers: async () => {
    const response = await api.get('/api/message/online');
    return response.data;
  },

  getMessages: async (userId) => {
    const response = await api.get(`/api/message/${userId}`);
    return response.data;
  },

  getRoomMessages: async (roomId) => {
    const response = await api.get(`/api/message/room/${roomId}`);
    return response.data;
  },

  sendMessage: async (receiverId, data) => {
    const response = await api.post(`/api/message/send/${receiverId}`, data);
    return response.data;
  },

  sendRoomMessage: async (roomId, data) => {
    const response = await api.post(`/api/message/room/${roomId}`, data);
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/api/message/${messageId}`);
    return response.data;
  },

  editMessage: async (messageId, text) => {
    const response = await api.put(`/api/message/${messageId}`, { text });
    return response.data;
  },

  addReaction: async (messageId, emoji) => {
    const response = await api.post(`/api/message/${messageId}/reaction`, { emoji });
    return response.data;
  },

  markAsRead: async (messageId) => {
    const response = await api.post(`/api/message/${messageId}/read`);
    return response.data;
  },

  markViewOnceViewed: async (messageId) => {
    const response = await api.post(`/api/message/${messageId}/view-once`);
    return response.data;
  },
};
