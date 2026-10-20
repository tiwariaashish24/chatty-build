import api from '@/lib/axios';

export const uploadService = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/upload/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteFile: async (publicId) => {
    const response = await api.delete('/api/upload/delete', {
      data: { publicId },
    });
    return response.data;
  },
};
