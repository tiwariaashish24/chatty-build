import api from '@/lib/axios';

export const roomService = {
  createRoom: async (roomData) => {
    const response = await api.post('/api/room', roomData);
    return response.data;
  },

  getUserRooms: async () => {
    const response = await api.get('/api/room');
    return response.data;
  },

  getRoom: async (roomId) => {
    const response = await api.get(`/api/room/${roomId}`);
    return response.data;
  },

  joinRoom: async (roomId) => {
    const response = await api.post(`/api/room/${roomId}/join`);
    return response.data;
  },

  leaveRoom: async (roomId) => {
    const response = await api.post(`/api/room/${roomId}/leave`);
    return response.data;
  },

  addMember: async (roomId, userId) => {
    const response = await api.post(`/api/room/${roomId}/add-member`, { userId });
    return response.data;
  },

  removeMember: async (roomId, userId) => {
    const response = await api.delete(`/api/room/${roomId}/members/${userId}`);
    return response.data;
  },

  updateRoom: async (roomId, roomData) => {
    const response = await api.put(`/api/room/${roomId}`, roomData);
    return response.data;
  },

  deleteRoom: async (roomId) => {
    const response = await api.delete(`/api/room/${roomId}`);
    return response.data;
  },
};
