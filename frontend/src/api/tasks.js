import axiosInstance from './axios';

export const tasksAPI = {
  getTasks: async (params = {}) => {
    const response = await axiosInstance.get('/tasks/', { params });
    return response.data;
  },

  getTask: async (id) => {
    const response = await axiosInstance.get(`/tasks/${id}/`);
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await axiosInstance.post('/tasks/', taskData);
    return response.data;
  },

  updateTask: async (id, taskData) => {
    const response = await axiosInstance.put(`/tasks/${id}/`, taskData);
    return response.data;
  },

  partialUpdateTask: async (id, taskData) => {
    const response = await axiosInstance.patch(`/tasks/${id}/`, taskData);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await axiosInstance.delete(`/tasks/${id}/`);
    return response.data;
  },

  reorderTasks: async (taskIds) => {
    const response = await axiosInstance.post('/tasks/reorder/', {
      task_ids: taskIds,
    });
    return response.data;
  },

  getTaskSummary: async () => {
    const response = await axiosInstance.get('/tasks/summary/');
    return response.data;
  },

  getAdminOverview: async () => {
    const response = await axiosInstance.get('/tasks/admin/overview/');
    return response.data;
  },

  getTaskAssignments: async (taskId) => {
    const response = await axiosInstance.get(`/tasks/${taskId}/roles/`);
    return response.data;
  },

  createTaskAssignment: async (taskId, payload) => {
    const response = await axiosInstance.post(`/tasks/${taskId}/roles/`, payload);
    return response.data;
  },

  updateTaskAssignment: async (taskId, assignmentId, payload) => {
    const response = await axiosInstance.patch(`/tasks/${taskId}/roles/${assignmentId}/`, payload);
    return response.data;
  },

  deleteTaskAssignment: async (taskId, assignmentId) => {
    const response = await axiosInstance.delete(`/tasks/${taskId}/roles/${assignmentId}/`);
    return response.data;
  },
};