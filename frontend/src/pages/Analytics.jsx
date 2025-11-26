import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import TaskStats from '../components/tasks/TaskStats';
import Spinner from '../components/common/Spinner';
import { tasksAPI } from '../api/tasks';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await tasksAPI.getTaskSummary();
      setStats(data);
    } catch (err) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
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

  // Status Chart Data
  const statusChartData = {
    labels: ['Pending', 'Completed'],
    datasets: [
      {
        label: 'Tasks by Status',
        data: [stats?.pending || 0, stats?.completed || 0],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Priority Chart Data
  const priorityChartData = {
    labels: ['High Priority', 'Other Tasks'],
    datasets: [
      {
        label: 'Tasks by Priority',
        data: [
          stats?.high_priority || 0,
          (stats?.total_tasks || 0) - (stats?.high_priority || 0),
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Bar Chart Data
  const barChartData = {
    labels: ['Total', 'Completed', 'Pending', 'High Priority'],
    datasets: [
      {
        label: 'Task Count',
        data: [
          stats?.total_tasks || 0,
          stats?.completed || 0,
          stats?.pending || 0,
          stats?.high_priority || 0,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
        },
      },
      x: {
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics Dashboard
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Visual overview of your tasks
        </p>
      </div>

      <TaskStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tasks by Status
          </h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={statusChartData} options={chartOptions} />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Priority Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={priorityChartData} options={chartOptions} />
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Task Overview
        </h3>
        <div className="h-80">
          <Bar data={barChartData} options={barOptions} />
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Completion Rate
          </h4>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            {stats?.total_tasks > 0
              ? Math.round((stats.completed / stats.total_tasks) * 100)
              : 0}
            %
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {stats?.completed} out of {stats?.total_tasks} tasks completed
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            High Priority Tasks
          </h4>
          <p className="text-4xl font-bold text-red-600 dark:text-red-400">
            {stats?.high_priority || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Requires immediate attention
          </p>
        </Card>
      </div>
    </Layout>
  );
};

export default Analytics;