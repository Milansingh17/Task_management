import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  Bars3BottomLeftIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { PRIORITY_COLORS, STATUS_COLORS } from '../../utils/constants';
import { formatDate, truncate } from '../../utils/helpers';

const TaskCard = ({
  task,
  onDelete,
  onStatusToggle,
  dragHandleProps = {},
  isDragDisabled = false,
  currentUser,
}) => {
  const navigate = useNavigate();
  const isOwner = currentUser?.id === task.owner;
  const assignment = task.current_assignment;

  return (
    <Card hover className="animate-fade-in">
      <div className="flex justify-between items-start mb-3 gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-2">
            {task.title}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge color={PRIORITY_COLORS[task.priority]}>
              {task.priority}
            </Badge>
            <Badge color={STATUS_COLORS[task.status]}>
              {task.status}
            </Badge>
            {!isOwner && (
              <Badge color="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                Owner: {task.owner_username}
              </Badge>
            )}
            {assignment && (
              <Badge color="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">
                Role: {assignment.assigned_role}
              </Badge>
            )}
          </div>
        </div>
        <button
          type="button"
          aria-label="Drag to reorder task"
          disabled={isDragDisabled}
          className={`p-2 rounded-lg transition-colors ${
            isDragDisabled
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing'
          }`}
          {...(!isDragDisabled ? dragHandleProps : {})}
        >
          <Bars3BottomLeftIcon className="w-5 h-5" />
        </button>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {truncate(task.description, 150)}
      </p>

      {assignment && (
        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-lg p-3 mb-4 text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
          <UserIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
          <div>
            <p className="font-semibold">Assignment Details</p>
            <p>
              Deadline:{' '}
              {assignment.submission_deadline
                ? formatDate(assignment.submission_deadline)
                : 'Not set'}
            </p>
            {assignment.feedback_notes && (
              <p>Notes: {truncate(assignment.feedback_notes, 120)}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
        <ClockIcon className="w-4 h-4 mr-2" />
        <span>{formatDate(task.created_at)}</span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t dark:border-gray-700">
        <div className="flex gap-2">
          {isOwner ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/tasks/edit/${task.id}`)}
              >
                <PencilIcon className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(task.id)}
              >
                <TrashIcon className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/tasks/edit/${task.id}`)}
            >
              View Details
            </Button>
          )}
        </div>
        <Button
          variant={task.status === 'Completed' ? 'secondary' : 'success'}
          size="sm"
          onClick={() => onStatusToggle(task)}
        >
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          {task.status === 'Completed' ? 'Mark Pending' : 'Complete'}
        </Button>
      </div>
    </Card>
  );
};

export default TaskCard;
