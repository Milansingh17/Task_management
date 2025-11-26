import React, { useState, useEffect, useCallback, useMemo, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import Layout from '../components/layout/Layout';
import TaskStats from '../components/tasks/TaskStats';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskList from '../components/tasks/TaskList';
import Pagination from '../components/common/Pagination';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { tasksAPI } from '../api/tasks';
import { debounce, getWebSocketUrl } from '../utils/helpers';
import toast from 'react-hot-toast';
import { DEFAULT_PAGE_SIZE, WS_TASK_PATH } from '../utils/constants';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    ordering: '-created_at',
  });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, taskId: null });
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const socketRef = useRef(null);
  const reconnectTimeout = useRef(null);

  const fetchTasks = useCallback(async (page = 1, overrideFilters) => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters = overrideFilters || filters;
      const params = {
        page,
        ordering: activeFilters.ordering,
        ...(activeFilters.status && { status: activeFilters.status }),
        ...(activeFilters.priority && { priority: activeFilters.priority }),
        ...(activeFilters.search && { search: activeFilters.search }),
      };

      const data = await tasksAPI.getTasks(params);
      setTasks(data.results || []);
      // Handle pagination - API should return count, but fallback to results length
      const totalCount = data.count !== undefined ? data.count : (data.results?.length || 0);
      setTotalPages(Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE)));
    } catch (err) {
      setError(err.message || 'Unable to load tasks');
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await tasksAPI.getTaskSummary();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchTasks(currentPage);
  }, [currentPage, fetchTasks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    fetchTasks(1, newFilters);
  }, [fetchTasks]);

  const debouncedSearch = useMemo(
    () =>
      debounce((searchTerm, currentFilters) => {
        const updatedFilters = { ...currentFilters, search: searchTerm };
        handleFilterChange(updatedFilters);
      }, 500),
    [handleFilterChange]
  );

  const handleSearch = (searchTerm) => {
    debouncedSearch(searchTerm, filters);
  };

  const handleDelete = (taskId) => {
    setDeleteModal({ isOpen: true, taskId });
  };

  const confirmDelete = async () => {
    try {
      await tasksAPI.deleteTask(deleteModal.taskId);
      toast.success('Task deleted successfully!');
      fetchTasks(currentPage);
      setDeleteModal({ isOpen: false, taskId: null });
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusToggle = async (task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await tasksAPI.partialUpdateTask(task.id, { status: newStatus });
      toast.success(`Task marked as ${newStatus}!`);
      fetchTasks(currentPage);
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReorder = async (updatedTasks) => {
    setTasks(updatedTasks);
    const ownedTaskIds = updatedTasks
      .filter(task => task.owner === user?.id)
      .map(task => task.id);

    if (!user) {
      toast.error('Unable to reorder without an active session.');
      return;
    }

    if (ownedTaskIds.length === 0) {
      toast.error('Only task owners can reorder tasks.');
      return;
    }

    try {
      await tasksAPI.reorderTasks(ownedTaskIds);
      toast.success('Task order updated');
      if (filters.ordering !== '-position') {
        const newFilters = { ...filters, ordering: '-position' };
        setFilters(newFilters);
        setCurrentPage(1);
        fetchTasks(1, newFilters);
        toast('Switched to manual order', { icon: '✨' });
      } else {
        fetchTasks(currentPage);
      }
    } catch (err) {
      toast.error('Failed to reorder tasks');
      fetchTasks(currentPage);
    }
  };

  const handleSocketMessage = useCallback((event) => {
    try {
      const payload = JSON.parse(event.data);
      const { event: type, data } = payload;

      switch (type) {
        case 'task_summary':
          setStats(data);
          break;
        case 'task_created':
        case 'task_updated':
        case 'task_deleted':
        case 'tasks_reordered':
          fetchTasks(currentPage);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Failed to parse realtime payload', err);
    }
  }, [fetchTasks, currentPage]);

  const connectWebSocket = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return;
    }

    if (socketRef.current) {
      socketRef.current.close();
    }

    setSocketStatus('connecting');
    const socket = new WebSocket(`${getWebSocketUrl()}${WS_TASK_PATH}?token=${token}`);
    socketRef.current = socket;

    socket.onopen = () => setSocketStatus('connected');
    socket.onmessage = handleSocketMessage;
    socket.onerror = () => socket.close();
    socket.onclose = () => {
      if (socketRef.current === socket) {
        setSocketStatus('disconnected');
        reconnectTimeout.current = setTimeout(() => connectWebSocket(), 3000);
      }
    };
  }, [handleSocketMessage]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close();
        socketRef.current = null;
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [connectWebSocket]);

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Task Dashboard
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage and track all your tasks
          </p>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${
              socketStatus === 'connected'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {socketStatus === 'connected' ? 'Live updates' : 'Offline'}
          </span>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/tasks/create')}
          className="flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create New Task
        </Button>
      </div>

      <TaskStats stats={stats} />
      
      <TaskFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
      />

      <TaskList
        tasks={tasks}
        loading={loading}
        error={error}
        onDelete={handleDelete}
        onStatusToggle={handleStatusToggle}
        onReorder={handleReorder}
        currentUser={user}
      />

      {tasks.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, taskId: null })}
        title="Delete Task"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ isOpen: false, taskId: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              Delete Task
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Dashboard;