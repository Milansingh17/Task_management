from rest_framework import permissions

from .models import TaskRoleAssignment


class IsTaskOwner(permissions.BasePermission):
    """
    Allow task owners full access and assignees read-only visibility.
    Assignees can submit work by updating limited fields (status only).
    """

    ASSIGNEE_MUTABLE_FIELDS = {'status'}

    def has_object_permission(self, request, view, obj):
        if obj.owner == request.user:
            return True

        is_assignee = TaskRoleAssignment.objects.filter(
            task=obj,
            user=request.user,
            is_active=True
        ).exists()

        if not is_assignee:
            return False

        if request.method in permissions.SAFE_METHODS:
            return True

        if request.method == 'PATCH':
            requested_fields = set(request.data.keys())
            return requested_fields.issubset(self.ASSIGNEE_MUTABLE_FIELDS)

        return False