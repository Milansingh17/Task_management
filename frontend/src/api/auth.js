import axiosInstance from './axios';

export const authAPI = {
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register/', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login/', credentials);
    return response.data;
  },

  logout: async (refreshToken) => {
    const response = await axiosInstance.post('/auth/logout/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/auth/profile/');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await axiosInstance.patch('/auth/profile/', userData);
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await axiosInstance.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await axiosInstance.get('/auth/users/', {
      params: { search: query },
    });
    return response.data;
  },
};