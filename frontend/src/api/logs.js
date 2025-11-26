import axiosInstance from './axios';

export const logsAPI = {
  getLogs: async (params = {}) => {
    const response = await axiosInstance.get('/logs/', { params });
    return response.data;
  },

  getLog: async (id) => {
    const response = await axiosInstance.get(`/logs/${id}/`);
    return response.data;
  },
};