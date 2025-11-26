import { useState, useEffect, useCallback } from 'react';
import { tasksAPI } from '../api/tasks';
import toast from 'react-hot-toast';

export const useTasks = (initialParams = {}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksAPI.getTasks({ ...initialParams, ...params });
      setTasks(data.results || []);
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
      });
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  const createTask = async (taskData) => {
    try {
      await tasksAPI.createTask(taskData);
      toast.success('Task created successfully!');
      fetchTasks();
      return { success: true };
    } catch (err) {
      toast.error('Failed to create task');
      return { success: false, error: err.message };
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      await tasksAPI.updateTask(id, taskData);
      toast.success('Task updated successfully!');
      fetchTasks();
      return { success: true };
    } catch (err) {
      toast.error('Failed to update task');
      return { success: false, error: err.message };
    }
  };

  const deleteTask = async (id) => {
    try {
      await tasksAPI.deleteTask(id);
      toast.success('Task deleted successfully!');
      fetchTasks();
      return { success: true };
    } catch (err) {
      toast.error('Failed to delete task');
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    pagination,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
};