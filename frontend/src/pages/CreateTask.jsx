import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import TaskForm from '../components/tasks/TaskForm';
import { tasksAPI } from '../api/tasks';
import toast from 'react-hot-toast';

const CreateTask = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await tasksAPI.createTask(formData);
      toast.success('Task created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Task
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Add a new task to your list
          </p>
        </div>

        <Card>
          <TaskForm
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Create Task"
          />
        </Card>
      </div>
    </Layout>
  );
};

export default CreateTask;