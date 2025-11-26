import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import TaskStats from '../components/tasks/TaskStats';
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import { tasksAPI } from '../api/tasks';
import toast from 'react-hot-toast';
import { PRIORITY_COLORS, STATUS_COLORS } from '../utils/constants';
import { formatDate } from '../utils/helpers';

const AdminPanel = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const data = await tasksAPI.getAdminOverview();
        setOverview(data);
      } catch (err) {
        toast.error('Failed to load admin overview');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  const totals = overview?.totals || {};

  const renderBreakdown = (breakdown = {}, total = 0) => (
    Object.entries(breakdown).map(([key, value]) => {
      const percentage = total ? Math.round((value / total) * 100) : 0;
      return (
        <div key={key}>
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
            <span className="capitalize">{key.replace('_', ' ')}</span>
            <span>{value}</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-primary-500 h-2 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      );
    })
  );

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Control Panel
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Organization-wide insights, trends, and activity.
        </p>
      </div>

      <TaskStats stats={totals} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Priority Breakdown
          </h3>
          <div className="space-y-4">
            {renderBreakdown(overview?.priority_breakdown, totals.total_tasks)}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Status Breakdown
          </h3>
          <div className="space-y-4">
            {renderBreakdown(overview?.status_breakdown, totals.total_tasks)}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Contributors
          </h3>
          <div className="space-y-4">
            {overview?.top_users?.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No data available.</p>
            )}
            {overview?.top_users?.map((user) => (
              <div key={user.username} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.completed} completed • {user.high_priority} high priority
                  </p>
                </div>
                <Badge color="bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
                  {user.total} tasks
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Tasks
          </h3>
          <div className="space-y-4">
            {overview?.recent_tasks?.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No recent tasks.</p>
            )}
            {overview?.recent_tasks?.map((task) => (
              <div
                key={task.id}
                className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 dark:text-white">{task.title}</p>
                  <Badge color={STATUS_COLORS[task.status]}>
                    {task.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Owner: {task.owner_username}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge color={PRIORITY_COLORS[task.priority]}>
                    {task.priority}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(task.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminPanel;

