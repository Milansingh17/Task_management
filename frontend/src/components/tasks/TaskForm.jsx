import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { TASK_STATUS, TASK_PRIORITY } from '../../utils/constants';
import { validateRequired } from '../../utils/validation';

const TaskForm = ({ initialData, onSubmit, loading, submitLabel = 'Create Task' }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TASK_STATUS.PENDING,
    priority: TASK_PRIORITY.MEDIUM,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || TASK_STATUS.PENDING,
        priority: initialData.priority || TASK_PRIORITY.MEDIUM,
      });
      // Clear errors when initialData changes
      setErrors({});
    } else {
      // Reset form when initialData is cleared
      setFormData({
        title: '',
        description: '',
        status: TASK_STATUS.PENDING,
        priority: TASK_PRIORITY.MEDIUM,
      });
      setErrors({});
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!validateRequired(formData.title)) {
      newErrors.title = 'Title is required';
    }
    if (!validateRequired(formData.description)) {
      newErrors.description = 'Description is required';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const statusOptions = [
    { value: TASK_STATUS.PENDING, label: 'Pending' },
    { value: TASK_STATUS.COMPLETED, label: 'Completed' },
  ];

  const priorityOptions = [
    { value: TASK_PRIORITY.LOW, label: 'Low' },
    { value: TASK_PRIORITY.MEDIUM, label: 'Medium' },
    { value: TASK_PRIORITY.HIGH, label: 'High' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Task Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Enter task title"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`input-field ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
          placeholder="Enter task description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
        />

        <Select
          label="Priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          options={priorityOptions}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;