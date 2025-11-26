import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/common/Pagination';
import { logsAPI } from '../api/logs';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { 
  ClockIcon, 
  PlusCircleIcon, 
  PencilSquareIcon, 
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const data = await logsAPI.getLogs({ page });
      setLogs(data.results || []);
      const pageSize = 10; // Match backend PAGE_SIZE
      setTotalPages(Math.max(1, Math.ceil((data.count || 0) / pageSize)));
    } catch (err) {
      toast.error('Failed to fetch activity logs');
      setLogs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'Task Created':
        return <PlusCircleIcon className="w-5 h-5" />;
      case 'Task Updated':
        return <PencilSquareIcon className="w-5 h-5" />;
      case 'Task Deleted':
        return <TrashIcon className="w-5 h-5" />;
      case 'Status Changed':
      case 'Priority Changed':
        return <ArrowPathIcon className="w-5 h-5" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'Task Created':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Task Updated':
      case 'Status Changed':
      case 'Priority Changed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Task Deleted':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const renderChangedData = (log) => {
    try {
      const data = typeof log.changed_data_json === 'string' 
        ? JSON.parse(log.changed_data_json) 
        : log.changed_data_json;

      if (log.action === 'Task Created') {
        return (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p><span className="font-medium">Title:</span> {data.title}</p>
            <p><span className="font-medium">Priority:</span> {data.priority}</p>
            <p><span className="font-medium">Status:</span> {data.status}</p>
          </div>
        );
      }

      if (log.action === 'Status Changed' || log.action === 'Priority Changed') {
        return (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Changed from:</span> <span className="text-red-600 dark:text-red-400">{data.old}</span> 
            <span className="mx-2">→</span>
            <span className="text-green-600 dark:text-green-400 font-medium">{data.new}</span>
          </div>
        );
      }

      if (log.action === 'Task Updated') {
        return (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
            {Object.keys(data).map((key) => (
              <p key={key}>
                <span className="font-medium capitalize">{key}:</span> {data[key].old} → {data[key].new}
              </p>
            ))}
          </div>
        );
      }

      if (log.action === 'Task Deleted') {
        return (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p><span className="font-medium">Task:</span> {data.title}</p>
          </div>
        );
      }

      return null;
    } catch (err) {
      return <p className="mt-2 text-sm text-gray-500">{log.changed_data}</p>;
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

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Activity Log
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Track all changes to your tasks
        </p>
      </div>

      {logs.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ClockIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No activity yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Your task activities will appear here
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {logs.map((log) => (
              <Card key={log.id} className="animate-fade-in">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {log.action}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {log.task_title}
                        </p>
                      </div>
                      <Badge color={getActionColor(log.action)}>
                        {log.username}
                      </Badge>
                    </div>
                    
                    {renderChangedData(log)}
                    
                    <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      {formatDate(log.timestamp)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </Layout>
  );
};

export default ActivityLog;