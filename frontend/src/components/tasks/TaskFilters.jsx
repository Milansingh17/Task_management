import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Select from '../common/Select';
import Button from '../common/Button';
import { TASK_STATUS, TASK_PRIORITY } from '../../utils/constants';

const DEFAULT_ORDERING = '-created_at';
const baseFilters = {
  status: '',
  priority: '',
  search: '',
  ordering: DEFAULT_ORDERING,
};

const TaskFilters = ({ filters: controlledFilters = baseFilters, onFilterChange, onSearch }) => {
  const [filters, setFilters] = useState(controlledFilters);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setFilters(prev => ({ ...prev, ...controlledFilters }));
  }, [controlledFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, search: value }));
    onSearch(value);
  };

  const clearFilters = () => {
    setFilters(baseFilters);
    onFilterChange(baseFilters);
    onSearch('');
  };

  const hasActiveFilters = Boolean(
    filters.status ||
    filters.priority ||
    filters.search ||
    filters.ordering !== DEFAULT_ORDERING
  );

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: TASK_STATUS.PENDING, label: 'Pending' },
    { value: TASK_STATUS.COMPLETED, label: 'Completed' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: TASK_PRIORITY.LOW, label: 'Low' },
    { value: TASK_PRIORITY.MEDIUM, label: 'Medium' },
    { value: TASK_PRIORITY.HIGH, label: 'High' },
  ];

  const orderingOptions = [
    { value: '-created_at', label: 'Newest first' },
    { value: 'created_at', label: 'Oldest first' },
    { value: '-priority', label: 'Priority (High → Low)' },
    { value: 'priority', label: 'Priority (Low → High)' },
    { value: '-position', label: 'Manual order (Drag & Drop)' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={handleSearchChange}
              className="input-field pl-10"
              placeholder="Search tasks by title..."
            />
          </div>
        </div>

        {/* Filter Toggle Button */}
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {[filters.status, filters.priority, filters.search].filter(Boolean).length +
                  (filters.ordering !== DEFAULT_ORDERING ? 1 : 0)}
              </span>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="secondary"
              onClick={clearFilters}
              className="flex items-center"
            >
              <XMarkIcon className="h-5 w-5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-in">
          <Select
            label="Status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            options={statusOptions}
          />

          <Select
            label="Priority"
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            options={priorityOptions}
          />

          <Select
            label="Sort By"
            name="ordering"
            value={filters.ordering}
            onChange={handleFilterChange}
            options={orderingOptions}
          />
        </div>
      )}
    </div>
  );
};

export default TaskFilters;