import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import TaskForm from '../components/tasks/TaskForm';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import { tasksAPI } from '../api/tasks';
import toast from 'react-hot-toast';
import RoleAssignmentPanel from '../components/tasks/RoleAssignmentPanel';
import { AuthContext } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import { PRIORITY_COLORS, STATUS_COLORS } from '../utils/constants';
import { formatDate } from '../utils/helpers';

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchTask = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksAPI.getTask(id);
      setTask(data);
    } catch (err) {
      setError('Failed to fetch task details');
      toast.error('Failed to fetch task details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await tasksAPI.updateTask(id, formData);
      toast.success('Task updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!task) return;
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    setStatusUpdating(true);
    try {
      await tasksAPI.partialUpdateTask(id, { status: newStatus });
      toast.success(`Task marked as ${newStatus}`);
      fetchTask();
    } catch (err) {
      toast.error('Failed to update task status');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert type="error" message={error} />
      </Layout>
    );
  }

  const isOwner = user?.id === task.owner;
  const canManageAssignments = Boolean(
    task && (isOwner || user?.is_superuser || user?.can_manage_tasks)
  );

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Task
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {isOwner ? 'Update task details' : 'View task details'}
          </p>
        </div>

        {isOwner ? (
          <Card>
            <TaskForm
              initialData={task}
              onSubmit={handleSubmit}
              loading={submitting}
              submitLabel="Update Task"
            />
          </Card>
        ) : (
          <Card>
            <div className="space-y-4">
              <Alert
                type="info"
                message="You have read-only access to this task. You can update status but cannot change task metadata."
              />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  {task.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {task.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge color={STATUS_COLORS[task.status]}>
                  {task.status}
                </Badge>
                <Badge color={PRIORITY_COLORS[task.priority]}>
                  {task.priority}
                </Badge>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <p>Owner: <span className="font-semibold text-gray-700 dark:text-gray-200">{task.owner_username}</span></p>
                <p>Created: {formatDate(task.created_at)}</p>
                <p>Last Updated: {formatDate(task.updated_at)}</p>
              </div>
              {task.current_assignment && (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Your role: {task.current_assignment.assigned_role}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    Deadline:{' '}
                    {task.current_assignment.submission_deadline
                      ? formatDate(task.current_assignment.submission_deadline)
                      : 'Not set'}
                  </p>
                  {task.current_assignment.feedback_notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Notes: {task.current_assignment.feedback_notes}
                    </p>
                  )}
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  variant={task.status === 'Completed' ? 'secondary' : 'success'}
                  onClick={handleStatusUpdate}
                  disabled={statusUpdating}
                >
                  {statusUpdating ? 'Updating...' : task.status === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="mt-6">
          <RoleAssignmentPanel taskId={task.id} canManage={canManageAssignments} />
        </div>
      </div>
    </Layout>
  );
};

export default EditTask;