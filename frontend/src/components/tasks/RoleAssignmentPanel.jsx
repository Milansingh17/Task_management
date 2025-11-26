import React, { useEffect, useState } from 'react';
import Card from '../common/Card';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import Badge from '../common/Badge';
import { tasksAPI } from '../../api/tasks';
import { authAPI } from '../../api/auth';
import toast from 'react-hot-toast';
import { formatDate, truncate, toDateTimeLocalValue, fromDateTimeLocalValue } from '../../utils/helpers';

const ROLE_OPTIONS = [
  { value: 'Member', label: 'Member' },
  { value: 'Reviewer', label: 'Reviewer' },
  { value: 'Contributor', label: 'Contributor' },
];

const defaultFormState = {
  userId: '',
  assignedRole: ROLE_OPTIONS[0].value,
  submissionDeadline: '',
  feedbackNotes: '',
};

const RoleAssignmentPanel = ({ taskId, canManage }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(defaultFormState);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const data = await tasksAPI.getTaskAssignments(taskId);
        if (isMounted) {
          setAssignments(data);
        }
      } catch (error) {
        toast.error('Failed to load role assignments');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAssignments();
    return () => {
      isMounted = false;
    };
  }, [taskId]);

  useEffect(() => {
    if (!canManage) {
      return;
    }
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await authAPI.searchUsers(searchTerm.trim());
        setSearchResults(results);
      } catch (error) {
        toast.error('Unable to search users');
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, canManage]);

  const resetForm = () => {
    setFormData(defaultFormState);
    setEditingAssignment(null);
    setSearchTerm('');
    setSearchResults([]);
    setSelectedUser(null);
  };

  const refreshAssignments = async () => {
    try {
      const data = await tasksAPI.getTaskAssignments(taskId);
      setAssignments(data);
    } catch (error) {
      toast.error('Unable to refresh assignments');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setFormData((prev) => ({ ...prev, userId: user.id }));
    setSearchResults([]);
    setSearchTerm(user.username);
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setSelectedUser(assignment.user);
    setFormData({
      userId: assignment.user.id,
      assignedRole: assignment.assigned_role,
      submissionDeadline: toDateTimeLocalValue(assignment.submission_deadline),
      feedbackNotes: assignment.feedback_notes || '',
    });
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Remove this collaborator?')) {
      return;
    }
    try {
      await tasksAPI.deleteTaskAssignment(taskId, assignmentId);
      toast.success('Assignment removed');
      refreshAssignments();
      if (editingAssignment?.id === assignmentId) {
        resetForm();
      }
    } catch (error) {
      toast.error('Failed to remove assignment');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId) {
      toast.error('Please select a user to assign');
      return;
    }
    setSubmitting(true);
    const payload = {
      user_id: formData.userId,
      assigned_role: formData.assignedRole,
      submission_deadline: formData.submissionDeadline
        ? fromDateTimeLocalValue(formData.submissionDeadline)
        : null,
      feedback_notes: formData.feedbackNotes || '',
    };

    try {
      if (editingAssignment) {
        await tasksAPI.updateTaskAssignment(taskId, editingAssignment.id, payload);
        toast.success('Assignment updated');
      } else {
        await tasksAPI.createTaskAssignment(taskId, payload);
        toast.success('Role assigned successfully');
      }
      refreshAssignments();
      resetForm();
    } catch (error) {
      const message = error.response?.data?.detail || 'Unable to save assignment';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const minDeadlineValue = toDateTimeLocalValue(new Date().toISOString());

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Task Collaborators
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Assign members, reviewers, or contributors to this task.
          </p>
        </div>
        {!canManage && (
          <Badge color="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
            View only
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {assignments.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              No collaborators yet.
            </p>
          ) : (
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/60">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feedback / Notes
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned By
                    </th>
                    {canManage && (
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        <div className="font-semibold">{assignment.user.username}</div>
                        <div className="text-xs text-gray-500">{assignment.user.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge color="bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200">
                          {assignment.assigned_role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {assignment.submission_deadline ? formatDate(assignment.submission_deadline) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {assignment.feedback_notes ? truncate(assignment.feedback_notes, 80) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {assignment.assigned_by?.username || '—'}
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() => handleEdit(assignment)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            variant="danger"
                            onClick={() => handleDelete(assignment.id)}
                          >
                            Remove
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {canManage && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="Search user by username"
                    value={searchTerm}
                    name="userSearch"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type at least 2 characters..."
                  />
                  {searchLoading && (
                    <Spinner size="sm" className="absolute right-3 top-10" />
                  )}
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mt-1 shadow-lg">
                      {searchResults.map((user) => (
                        <button
                          type="button"
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                        >
                          <div className="font-semibold">{user.username}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Select
                  label="Assigned Role"
                  name="assignedRole"
                  value={formData.assignedRole}
                  onChange={handleFormChange}
                  options={ROLE_OPTIONS}
                />
              </div>

              {selectedUser && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Selected user: <span className="font-semibold">{selectedUser.username}</span>
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Submission Deadline"
                  type="datetime-local"
                  name="submissionDeadline"
                  value={formData.submissionDeadline}
                  onChange={handleFormChange}
                  min={minDeadlineValue}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Feedback / Notes
                  </label>
                  <textarea
                    name="feedbackNotes"
                    value={formData.feedbackNotes}
                    onChange={handleFormChange}
                    rows={3}
                    maxLength={2000}
                    className="input-field"
                    placeholder="Optional context for the assignee"
                  />
                  <p className="text-xs text-gray-400 text-right mt-1">
                    {formData.feedbackNotes.length}/2000
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                {editingAssignment && (
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    Cancel Edit
                  </Button>
                )}
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingAssignment ? 'Update Assignment' : 'Assign Role'}
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </Card>
  );
};

export default RoleAssignmentPanel;

