from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import transaction
from django.db.models import Count, Q, Case, When, IntegerField
from django.shortcuts import get_object_or_404

from .models import Task, TaskRoleAssignment
from .serializers import (
    TaskSerializer,
    TaskSummarySerializer,
    TaskReorderSerializer,
    TaskRoleAssignmentSerializer,
)
from .permissions import IsTaskOwner
from .filters import TaskFilter
from .realtime import (
    broadcast_full_task_list,
    get_user_task_summary,
)


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Task CRUD operations
    
    list: GET /api/tasks/
    create: POST /api/tasks/
    retrieve: GET /api/tasks/{id}/
    update: PUT /api/tasks/{id}/
    partial_update: PATCH /api/tasks/{id}/
    destroy: DELETE /api/tasks/{id}/
    """
    
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsTaskOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = TaskFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status', 'position']
    ordering = ['-position', '-created_at']
    
    def get_queryset(self):
        """Return tasks owned by or assigned to the authenticated user"""
        user = self.request.user
        queryset = Task.objects.select_related('owner').prefetch_related('role_assignments')

        if user.is_superuser or user.has_perm('tasks.task_manage'):
            base_queryset = queryset.distinct()
        else:
            base_queryset = queryset.filter(
                Q(owner=user) |
                Q(role_assignments__user=user, role_assignments__is_active=True)
            ).distinct()
        
        # Always annotate priority_weight for potential priority ordering
        base_queryset = base_queryset.annotate(
            priority_weight=Case(
                When(priority='High', then=3),
                When(priority='Medium', then=2),
                When(priority='Low', then=1),
                default=0,
                output_field=IntegerField()
            )
        )
        
        return base_queryset
    
    def filter_queryset(self, queryset):
        """Override to handle custom priority ordering"""
        queryset = super().filter_queryset(queryset)
        
        # Check if ordering by priority
        ordering_param = self.request.query_params.get('ordering', '')
        if ordering_param == 'priority':
            return queryset.order_by('priority_weight', '-created_at')
        elif ordering_param == '-priority':
            return queryset.order_by('-priority_weight', '-created_at')
        
        return queryset

    def get_permissions(self):
        if self.action == 'admin_overview':
            return [IsAuthenticated(), IsAdminUser()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        """Set the owner to the current user"""
        serializer.save(owner=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Custom create response"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        
        return Response({
            'message': 'Task created successfully',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        """Custom update response"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'message': 'Task updated successfully',
            'data': serializer.data
        })
    
    def destroy(self, request, *args, **kwargs):
        """Custom delete response"""
        instance = self.get_object()
        self.perform_destroy(instance)
        
        return Response({
            'message': 'Task deleted successfully'
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """
        Analytics Endpoint
        GET /api/tasks/summary/
        """
        summary_data = get_user_task_summary(request.user.id)
        serializer = TaskSummarySerializer(summary_data)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='reorder')
    def reorder(self, request):
        """
        Update manual ordering using drag & drop ids
        """
        serializer = TaskReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task_ids = serializer.validated_data['task_ids']

        tasks = list(Task.objects.filter(owner=request.user, id__in=task_ids))
        if len(tasks) != len(task_ids):
            return Response(
                {'error': 'One or more tasks could not be found.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        task_map = {task.id: task for task in tasks}
        sorted_positions = sorted([task.position for task in tasks], reverse=True)

        with transaction.atomic():
            updated_tasks = []
            for idx, task_id in enumerate(task_ids):
                task = task_map[task_id]
                new_position = sorted_positions[idx]
                if task.position != new_position:
                    task.position = new_position
                    task.save(update_fields=['position'])
                updated_tasks.append(task)

        broadcast_full_task_list(request.user.id)

        return Response({
            'message': 'Tasks reordered successfully',
            'data': TaskSerializer(updated_tasks, many=True).data
        })

    @action(detail=False, methods=['get'], url_path='admin/overview',
            permission_classes=[IsAuthenticated, IsAdminUser])
    def admin_overview(self, request):
        """
        Aggregate stats for staff users.
        """
        queryset = Task.objects.select_related('owner')

        totals = {
            'total_tasks': queryset.count(),
            'completed': queryset.filter(status='Completed').count(),
            'pending': queryset.filter(status='Pending').count(),
            'high_priority': queryset.filter(priority='High').count(),
        }
        priority_breakdown = {
            'high': queryset.filter(priority='High').count(),
            'medium': queryset.filter(priority='Medium').count(),
            'low': queryset.filter(priority='Low').count(),
        }
        status_breakdown = {
            'completed': totals['completed'],
            'pending': totals['pending'],
        }

        top_users = list(
            queryset.values('owner__username').annotate(
                total=Count('id'),
                completed=Count('id', filter=Q(status='Completed')),
                high_priority=Count('id', filter=Q(priority='High')),
            ).order_by('-total')[:5]
        )

        recent_tasks = queryset.order_by('-created_at')[:5]

        return Response({
            'totals': totals,
            'priority_breakdown': priority_breakdown,
            'status_breakdown': status_breakdown,
            'top_users': [
                {
                    'username': row['owner__username'],
                    'total': row['total'],
                    'completed': row['completed'],
                    'high_priority': row['high_priority'],
                } for row in top_users
            ],
            'recent_tasks': TaskSerializer(recent_tasks, many=True).data,
        })


class TaskRoleAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = TaskRoleAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['task'] = self._get_task()
        return context

    def _get_task(self):
        if not hasattr(self, '_task_cache'):
            self._task_cache = get_object_or_404(Task, pk=self.kwargs.get('task_pk'))
        return self._task_cache

    def _user_can_manage_task(self, task):
        user = self.request.user
        if not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        if task.owner_id == user.id:
            return True
        return user.has_perm('tasks.task_manage')

    def _user_can_view_task(self, task):
        if self._user_can_manage_task(task):
            return True
        return TaskRoleAssignment.objects.filter(
            task=task,
            user=self.request.user,
            is_active=True
        ).exists()

    def _user_can_modify_assignment(self, assignment):
        user = self.request.user
        if not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        if assignment.task.owner_id == user.id:
            return True
        if user.has_perm('tasks.task_manage'):
            return assignment.assigned_by_id == user.id or assignment.user_id == user.id
        return False

    def get_queryset(self):
        task = self._get_task()
        if not self._user_can_view_task(task):
            raise PermissionDenied('You do not have access to this task.')
        qs = TaskRoleAssignment.objects.filter(
            task=task,
            is_active=True
        ).select_related('user', 'assigned_by', 'task')
        if self._user_can_manage_task(task):
            return qs
        return qs.filter(user=self.request.user)

    def perform_create(self, serializer):
        task = self._get_task()
        if not self._user_can_manage_task(task):
            raise PermissionDenied('You are not allowed to assign roles for this task.')
        serializer.save(task=task, assigned_by=self.request.user)

    def perform_update(self, serializer):
        assignment = self.get_object()
        if not self._user_can_modify_assignment(assignment):
            raise PermissionDenied('You cannot modify this assignment.')
        serializer.save()

    def perform_destroy(self, instance):
        if not self._user_can_modify_assignment(instance):
            raise PermissionDenied('You cannot revoke this assignment.')
        instance.is_active = False
        instance.save(update_fields=['is_active'])