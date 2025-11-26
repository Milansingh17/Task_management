// Normalize API base URL so it always includes `/api`
const RAW_API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const NORMALIZED_API_BASE = RAW_API_BASE.replace(/\/+$/, ''); // strip trailing slashes
export const API_URL = `${NORMALIZED_API_BASE}/api`;
export const WS_TASK_PATH = '/ws/tasks/';
export const DEFAULT_PAGE_SIZE = 10;

export const TASK_STATUS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
};

export const TASK_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const PRIORITY_COLORS = {
  Low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  High: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export const STATUS_COLORS = {
  Pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export const AUDIT_ACTIONS = {
  CREATED: 'Task Created',
  UPDATED: 'Task Updated',
  DELETED: 'Task Deleted',
  STATUS_CHANGED: 'Status Changed',
  PRIORITY_CHANGED: 'Priority Changed',
};