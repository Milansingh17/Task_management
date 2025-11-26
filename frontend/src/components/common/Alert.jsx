import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Alert = ({ type = 'info', message, onClose }) => {
  const types = {
    success: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  };

  return (
    <div className={`p-4 rounded-lg border ${types[type]} flex items-center justify-between animate-fade-in`}>
      <p>{message}</p>
      {onClose && (
        <button onClick={onClose} className="ml-4 hover:opacity-80">
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;